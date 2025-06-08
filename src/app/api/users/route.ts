import { getTenantByDomain } from "@/entities/tenant/Tenant.services";
import {
  CreateUser,
  CreateUserSchema,
  UpdateUser,
  UpdateUserSchema,
} from "@/entities/user/User.schema";
import { emailService } from "@/libs/email/emailService";
import { welcomeEmailTemplate } from "@/libs/email/emailTemplates";
import { getAdminClient } from "@/libs/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const adminClient = getAdminClient();
  let createdUserId: string | null = null;
  let createdTenantUserId: number | null = null;

  try {
    const { userData, tenantId, tenantDomain } = await request.json();

    const validationResult = CreateUserSchema.safeParse(userData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const validatedData: CreateUser = validationResult.data;

    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: validatedData.email,
        password: validatedData.password,
        email_confirm: true,
      });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    const userId = authData.user!.id;
    createdUserId = userId;

    const { error: profileError } = await adminClient.from("users").insert({
      id: userId,
      email: validatedData.email,
    });

    if (profileError) {
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    const { data: tenantUserData, error: tenantUserError } = await adminClient
      .from("tenantUsers")
      .insert({
        userId: userId,
        tenantId: Number(tenantId),
        roleId: validatedData.roleId,
      })
      .select("id")
      .single();

    if (tenantUserError) {
      // Handle specific tenant user errors
      if (tenantUserError.code === "23505") {
        // Unique constraint violation
        throw new Error("User is already a member of this tenant");
      }
      throw new Error(
        `Failed to add user to tenant: ${tenantUserError.message}`
      );
    }

    createdTenantUserId = tenantUserData.id;

    // Create member profile if data provided
    if (validatedData.firstName && validatedData.lastName) {
      const { error: memberError } = await adminClient.from("members").insert({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        dateOfBirth: validatedData.dateOfBirth || null,
        gender: validatedData.gender || null,
        memberType: validatedData.memberType || null,
        tenantUserId: tenantUserData.id,
        tenantId: Number(tenantId),
      });

      if (memberError) {
        throw new Error(
          `Failed to create member profile: ${memberError.message}`
        );
      }
    }

    // Send welcome email if tenant domain is provided
    if (tenantDomain) {
      try {
        const tenant = await getTenantByDomain(tenantDomain, adminClient);
        if (tenant) {
          const template = welcomeEmailTemplate(
            tenant,
            validatedData.firstName || "User",
            `https://${tenantDomain}/auth/login`
          );

          await emailService.sendEmail(tenant, {
            to: validatedData.email,
            subject: template.subject,
            htmlContent: template.htmlContent,
            textContent: template.textContent,
          });
        }
      } catch (emailError) {
        // Log email error but don't fail user creation
        console.error("Failed to send welcome email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      tenantUserId: tenantUserData.id,
      message: "User created successfully",
    });
  } catch (error) {
    if (createdTenantUserId) {
      await adminClient
        .from("tenantUsers")
        .delete()
        .eq("id", createdTenantUserId);
    }

    if (createdUserId) {
      await adminClient.auth.admin.deleteUser(createdUserId);
      await adminClient.from("users").delete().eq("id", createdUserId);
    }

    const errorMessage = (error as Error).message;
    const statusCode = errorMessage.includes("already a member") ? 409 : 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, userData, tenantId } = await request.json();
    const adminClient = getAdminClient();

    // Validate input
    const validationResult = UpdateUserSchema.safeParse(userData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const validatedData: UpdateUser = validationResult.data;

    // Update auth user email if provided
    if (validatedData.email) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(
        userId,
        { email: validatedData.email }
      );
      if (authError)
        throw new Error(`Failed to update auth email: ${authError.message}`);
    }

    // Update users table (only email, no roleId)
    if (validatedData.email) {
      const { error: userError } = await adminClient
        .from("users")
        .update({
          email: validatedData.email,
        })
        .eq("id", userId);

      if (userError)
        throw new Error(`Failed to update user profile: ${userError.message}`);
    }

    // Update role in tenantUsers if provided
    if (validatedData.roleId) {
      const { error: roleError } = await adminClient
        .from("tenantUsers")
        .update({
          roleId: validatedData.roleId,
        })
        .eq("userId", userId)
        .eq("tenantId", Number(tenantId));

      if (roleError)
        throw new Error(`Failed to update user role: ${roleError.message}`);
    }

    // Handle member data if provided
    if (validatedData.firstName || validatedData.lastName) {
      // Get the tenantUserId first
      const { data: tenantUser } = await adminClient
        .from("tenantUsers")
        .select("id")
        .eq("userId", userId)
        .eq("tenantId", Number(tenantId))
        .single();

      if (!tenantUser) {
        throw new Error("User not found in tenant");
      }

      // Check if member record exists
      const { data: existingMember } = await adminClient
        .from("members")
        .select("id")
        .eq("tenantUserId", tenantUser.id)
        .maybeSingle();

      const memberData = {
        ...(validatedData.firstName && { firstName: validatedData.firstName }),
        ...(validatedData.lastName && { lastName: validatedData.lastName }),
        ...(validatedData.dateOfBirth && {
          dateOfBirth: validatedData.dateOfBirth,
        }),
        ...(validatedData.gender && { gender: validatedData.gender }),
        ...(validatedData.memberType && {
          memberType: validatedData.memberType,
        }),
      };

      if (existingMember) {
        // Update existing member
        const { error: memberError } = await adminClient
          .from("members")
          .update(memberData)
          .eq("id", existingMember.id);

        if (memberError)
          throw new Error(`Failed to update member: ${memberError.message}`);
      } else {
        // Create new member record
        const { error: memberError } = await adminClient
          .from("members")
          .insert({
            ...memberData,
            tenantUserId: tenantUser.id,
            tenantId: Number(tenantId),
          });

        if (memberError)
          throw new Error(`Failed to create member: ${memberError.message}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, tenantId } = await request.json();
    const adminClient = getAdminClient();

    const { data: tenantUser } = await adminClient
      .from("tenantUsers")
      .select("id")
      .eq("userId", userId)
      .eq("tenantId", Number(tenantId))
      .maybeSingle();

    if (tenantUser) {
      await adminClient
        .from("members")
        .delete()
        .eq("tenantUserId", tenantUser.id);
    }

    const { error: tenantUserError } = await adminClient
      .from("tenantUsers")
      .delete()
      .eq("userId", userId)
      .eq("tenantId", Number(tenantId));

    if (tenantUserError)
      throw new Error(
        `Failed to remove user from tenant: ${tenantUserError.message}`
      );

    const { data: otherTenants, error: tenantsError } = await adminClient
      .from("tenantUsers")
      .select("id")
      .eq("userId", userId);

    if (tenantsError)
      throw new Error(`Failed to check other tenants: ${tenantsError.message}`);

    if (!otherTenants?.length) {
      const { error: authError } = await adminClient.auth.admin.deleteUser(
        userId
      );
      if (authError)
        throw new Error(`Failed to delete auth user: ${authError.message}`);

      const { error: userError } = await adminClient
        .from("users")
        .delete()
        .eq("id", userId);

      if (userError) {
        if (userError.message.includes("teams_coachId_fkey")) {
          return NextResponse.json(
            {
              error:
                "This user is assigned as a coach to one or more teams. Please reassign or remove them as coach before deleting the user.",
            },
            { status: 400 }
          );
        }
        throw new Error(`Failed to delete user profile: ${userError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: otherTenants?.length
        ? "User removed from tenant"
        : "User completely deleted",
    });
  } catch (error) {
    // If somehow we missed catching the foreign key error earlier
    const message = (error as Error).message;
    if (message.includes("teams_coachId_fkey")) {
      return NextResponse.json(
        {
          error:
            "This user is assigned as a coach to one or more teams. Please reassign or remove them as coach before deleting the user.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
