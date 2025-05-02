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
        throw new Error("User is already a member of this tenant");
      }

      // Update user profile if it exists
      const { error: updateError } = await adminClient
        .from("users")
        .upsert({
          id: userId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
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
          user_metadata: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        });

      if (authError) throw new Error(`Auth error: ${authError.message}`);
      if (!authData?.user)
        throw new Error("No user data returned from auth creation");

      userId = authData.user.id;

      // Create or update user profile
      const { error: profileError } = await adminClient.from("users").upsert({
        id: userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
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

    // Create user roles if roleIds are provided
    if (userData.roleIds?.length) {
      const { error: roleError } = await adminClient.from("userRoles").insert(
        userData.roleIds.map((roleId: number) => ({
          userId: userId,
          roleId: roleId,
          tenantId: Number(tenantId),
        }))
      );

      if (roleError) {
        // Clean up on error
        await adminClient
          .from("tenantUsers")
          .delete()
          .eq("userId", userId)
          .eq("tenantId", Number(tenantId));
        if (!existingAuthUser) {
          await adminClient.auth.admin.deleteUser(userId);
        }
        throw new Error(`Role error: ${roleError.message}`);
      }
    }

    // Fetch the complete user data
    const { data: user, error: fetchError } = await adminClient
      .from("users")
      .select(
        `
        *,
        tenantUsers(
          id, 
          tenantId
        ),
        roles:userRoles!inner(
          id,
          roleId,
          tenantId,
          role:roles!inner(
            id,
            name,
            domain,
            permissions,
            tenantId
          )
        )
      `
      )
      .eq("id", userId)
      .single();

    if (fetchError)
      throw new Error(`Error fetching user: ${fetchError.message}`);

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, userData, tenantId, roleIds } = await request.json();
    const adminClient = getAdminClient();

    // Update auth user
    const { error: authError } = await adminClient.auth.admin.updateUserById(
      userId,
      {
        email: userData.email,
        user_metadata: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
      }
    );
    if (authError) throw new Error(authError.message);

    // Update users table
    const { error: userError } = await adminClient
      .from("users")
      .update({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      })
      .eq("id", userId);

    if (userError) throw new Error(userError.message);

    // Update user roles if provided
    if (roleIds) {
      // First, delete existing roles for this user in this tenant
      const { error: deleteRolesError } = await adminClient
        .from("userRoles")
        .delete()
        .eq("userId", userId)
        .eq("tenantId", tenantId);

      if (deleteRolesError) throw new Error(deleteRolesError.message);

      // Then insert new roles if any are provided
      if (roleIds.length > 0) {
        const { error: insertRolesError } = await adminClient
          .from("userRoles")
          .insert(
            roleIds.map((roleId: number) => ({
              userId,
              roleId,
              tenantId: Number(tenantId),
            }))
          );

        if (insertRolesError) throw new Error(insertRolesError.message);
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
    const { userId } = await request.json();
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

    // First delete player user connections
    const { error: playerConnectionsError } = await adminClient
      .from("playerUserConnections")
      .delete()
      .eq("userId", userId);

    if (playerConnectionsError) {
      if (playerConnectionsError.message.includes("foreign key constraint")) {
        return NextResponse.json(
          {
            error:
              "Cannot delete user because they have associated player connections. Please remove these connections first.",
          },
          { status: 400 }
        );
      }
      throw new Error(playerConnectionsError.message);
    }

    // Then delete user roles
    const { error: rolesError } = await adminClient
      .from("userRoles")
      .delete()
      .eq("userId", userId);

    if (rolesError) throw new Error(rolesError.message);

    // Then delete user from auth
    const { error: authError } = await adminClient.auth.admin.deleteUser(
      userId
    );
    if (authError) throw new Error(authError.message);

    // Finally delete user from users table
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
