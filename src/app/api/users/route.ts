import { getAdminClient } from "@/libs/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userData, tenantId } = await request.json();
    const adminClient = getAdminClient();

    // First check if user exists in auth
    const { data: authUser, error: authCheckError } =
      await adminClient.auth.admin.listUsers();

    if (authCheckError) {
      throw new Error(`Auth check error: ${authCheckError.message}`);
    }

    const existingAuthUser = authUser.users.find(
      (user) => user.email === userData.email
    );

    let userId: string;

    if (existingAuthUser) {
      userId = existingAuthUser.id;

      // Check if user is already in this tenant
      const { data: existingTenantUser, error: tenantUserError } =
        await adminClient
          .from("tenantUsers")
          .select("id")
          .eq("userId", userId)
          .eq("tenantId", Number(tenantId))
          .single();

      if (
        tenantUserError &&
        !tenantUserError.message.includes("No rows found")
      ) {
        throw new Error(
          `Error checking tenant user: ${tenantUserError.message}`
        );
      }

      if (existingTenantUser) {
        // User exists in tenant - let's check what's missing

        // Check if user profile exists
        const { data: existingUserProfile, error: userProfileError } =
          await adminClient
            .from("users")
            .select("id, email, roleId, userDomains")
            .eq("id", userId)
            .single();

        // Check if member record exists
        const { data: existingMember, error: memberError } = await adminClient
          .from("members")
          .select("id, firstName, lastName, memberType, userId, tenantId")
          .eq("userId", userId)
          .eq("tenantId", Number(tenantId))
          .single();

        // Determine what's missing
        const missingProfile =
          userProfileError?.message.includes("No rows found");
        const missingMember = memberError?.message.includes("No rows found");

        if (missingProfile || missingMember) {
          // Update missing data instead of throwing error
          if (missingProfile) {
            const { error: updateError } = await adminClient
              .from("users")
              .upsert({
                id: userId,
                email: userData.email,
                roleId: userData.roleId,
                userDomains: userData.userDomains || [],
              });

            if (updateError) {
              throw new Error(`Profile update error: ${updateError.message}`);
            }
          }

          if (missingMember && userData.firstName && userData.lastName) {
            const { error: memberInsertError } = await adminClient
              .from("members")
              .insert({
                firstName: userData.firstName,
                lastName: userData.lastName,
                dateOfBirth: userData.dateOfBirth,
                gender: userData.gender,
                memberType: userData.memberType,
                userId: userId,
                tenantId: Number(tenantId),
              });

            if (memberInsertError) {
              throw new Error(
                `Member creation error: ${memberInsertError.message}`
              );
            }
          }

          return NextResponse.json({
            success: true,
            userId,
            message:
              "User was already in tenant but missing data has been updated",
            updated: {
              profile: missingProfile,
              member: missingMember,
            },
          });
        } else {
          // User completely exists - provide detailed info
          return NextResponse.json(
            {
              error: "User is already a member of this tenant",
              details: {
                userId: userId,
                email: userData.email,
                hasProfile: !missingProfile,
                hasMember: !missingMember,
                existingMember: existingMember
                  ? {
                      name: `${existingMember.firstName} ${existingMember.lastName}`,
                      type: existingMember.memberType,
                    }
                  : null,
              },
            },
            { status: 409 }
          );
        }
      }

      // User exists in auth but not in this tenant - continue with normal flow
      // Update user profile if it exists
      const { error: updateError } = await adminClient
        .from("users")
        .upsert({
          id: userId,
          email: userData.email,
          roleId: userData.roleId,
          userDomains: userData.userDomains || [],
        })
        .eq("id", userId);

      if (updateError) {
        throw new Error(`Profile update error: ${updateError.message}`);
      }
    } else {
      // Create new user in auth
      const { data: authData, error: authError } =
        await adminClient.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
        });

      if (authError) throw new Error(`Auth error: ${authError.message}`);
      if (!authData?.user)
        throw new Error("No user data returned from auth creation");

      userId = authData.user.id;

      // Create user profile
      const { error: profileError } = await adminClient.from("users").upsert({
        id: userId,
        email: userData.email,
        roleId: userData.roleId,
        userDomains: userData.userDomains || [],
      });

      if (profileError) {
        await adminClient.auth.admin.deleteUser(userId);
        throw new Error(`Profile error: ${profileError.message}`);
      }
    }

    // Add user to tenant
    const { error: tenantUserError } = await adminClient
      .from("tenantUsers")
      .insert({
        userId: userId,
        tenantId: Number(tenantId),
      });

    if (tenantUserError) {
      if (!existingAuthUser) {
        await adminClient.auth.admin.deleteUser(userId);
      }
      throw new Error(`Tenant user error: ${tenantUserError.message}`);
    }

    // Handle member data
    if (userData.firstName && userData.lastName) {
      // First check if member record exists
      const { data: existingMember, error: memberCheckError } =
        await adminClient
          .from("members")
          .select("id")
          .eq("userId", userId)
          .eq("tenantId", Number(tenantId))
          .single();

      const memberData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        memberType: userData.memberType,
        userId: userId,
        tenantId: Number(tenantId),
      };

      if (existingMember) {
        // Update existing member
        const { error: memberError } = await adminClient
          .from("members")
          .update(memberData)
          .eq("id", existingMember.id);

        if (memberError) throw new Error(memberError.message);
      } else {
        // Insert new member
        const { error: memberError } = await adminClient
          .from("members")
          .insert(memberData);

        if (memberError) throw new Error(memberError.message);
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      message: existingAuthUser
        ? "Existing user added to tenant"
        : "New user created",
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, userData, tenantId } = await request.json();
    const adminClient = getAdminClient();

    // Update auth user email
    if (userData.email) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(
        userId,
        { email: userData.email }
      );
      if (authError) throw new Error(authError.message);
    }

    // Update users table
    const { error: userError } = await adminClient
      .from("users")
      .update({
        email: userData.email,
        roleId: userData.roleId,
        userDomains: userData.userDomains || [],
      })
      .eq("id", userId);

    if (userError) throw new Error(userError.message);

    // Handle member data
    if (userData.firstName && userData.lastName) {
      // First check if member record exists
      const { data: existingMember, error: memberCheckError } =
        await adminClient
          .from("members")
          .select("id")
          .eq("userId", userId)
          .eq("tenantId", Number(tenantId))
          .single();

      const memberData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        memberType: userData.memberType,
        userId: userId,
        tenantId: Number(tenantId),
      };

      if (existingMember) {
        // Update existing member
        const { error: memberError } = await adminClient
          .from("members")
          .update(memberData)
          .eq("id", existingMember.id);

        if (memberError) throw new Error(memberError.message);
      } else {
        // Insert new member
        const { error: memberError } = await adminClient
          .from("members")
          .insert(memberData);

        if (memberError) throw new Error(memberError.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, tenantId } = await request.json();
    const adminClient = getAdminClient();

    // Check if user is a coach for any teams
    const { data: teams } = await adminClient
      .from("teams")
      .select("id")
      .eq("coachId", userId);

    if (teams && teams.length > 0) {
      return NextResponse.json(
        {
          error:
            "This user is assigned as a coach to one or more teams. Please reassign or remove them as coach before deleting the user.",
        },
        { status: 400 }
      );
    }

    // First delete member records for this user in this tenant
    await adminClient
      .from("members")
      .delete()
      .eq("userId", userId)
      .eq("tenantId", Number(tenantId));

    // Remove user from tenant
    const { error: tenantUserError } = await adminClient
      .from("tenantUsers")
      .delete()
      .eq("userId", userId)
      .eq("tenantId", Number(tenantId));

    if (tenantUserError) throw new Error(tenantUserError.message);

    // Check if user exists in any other tenants
    const { data: otherTenants, error: tenantsError } = await adminClient
      .from("tenantUsers")
      .select("id")
      .eq("userId", userId);

    if (tenantsError) throw new Error(tenantsError.message);

    // Only delete the user completely if they don't belong to any other tenants
    if (!otherTenants?.length) {
      // Delete user from auth
      const { error: authError } = await adminClient.auth.admin.deleteUser(
        userId
      );
      if (authError) throw new Error(authError.message);

      // Delete user from users table
      const { error: userError } = await adminClient
        .from("users")
        .delete()
        .eq("id", userId);

      if (userError) {
        // Double check if it's a foreign key constraint error
        if (userError.message.includes("teams_coachId_fkey")) {
          return NextResponse.json(
            {
              error:
                "This user is assigned as a coach to one or more teams. Please reassign or remove them as coach before deleting the user.",
            },
            { status: 400 }
          );
        }
        throw new Error(userError.message);
      }
    }

    return NextResponse.json({ success: true });
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

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
