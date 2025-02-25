import { TypedClient } from "@/libs/supabase/type";
import { User, UserForm, UserSchema, UserUpdateForm } from "./User.schema";
import { getAdminClient } from "@/libs/supabase/admin";

// Get current authenticated user with roles
export const getCurrentUser = async (client: TypedClient) => {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  const { data, error } = await client
    .from("users")
    .select(
      `
      *,
      tenantUsers(id, tenantId, userId),
      roles:userRoles(
        id,
        roleId,
        tenantId,
        isPrimary,
        role:roles(
          id,
          name,
          domain,
          permissions,
          tenantId
        )
      )
    `
    )
    .eq("id", user.id)
    .single();

  if (error || !data) return null;

  return UserSchema.parse({
    ...data,
    roles: data.roles || [],
    tenantUsers: data.tenantUsers || [],
  });
};

// Keep the original function for middleware
export const getUserOnClient = async (typedClient: TypedClient) => {
  const {
    data: { user },
  } = await typedClient.auth.getUser();

  if (!user) {
    return;
  }

  return user;
};

// Get all users for a tenant with their roles
export const getUsersByTenantId = async (
  client: TypedClient,
  tenantId: string
): Promise<User[]> => {
  const { data, error } = await client
    .from("users")
    .select(
      `
      *,
      tenantUsers!inner(id, tenantId, userId),
      roles:userRoles!inner(
        id,
        roleId,
        tenantId,
        isPrimary,
        role:roles(
          id,
          name,
          domain,
          permissions,
          tenantId
        )
      )
    `
    )
    .eq("tenantUsers.tenantId", Number(tenantId))
    .eq("roles.tenantId", Number(tenantId));

  if (error) throw new Error(error.message);

  return data.map((user) =>
    UserSchema.parse({
      ...user,
      roles: user.roles || [],
      tenantUsers: user.tenantUsers || [],
    })
  );
};

// Create a new user with their roles
export const createUser = async (
  client: TypedClient,
  userData: UserForm,
  tenantId: string
) => {
  const adminClient = getAdminClient();

  // Use admin client to create user
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    });

  if (authError) throw new Error(authError.message);

  // Create user profile using regular client
  const { error: userError } = await client.from("users").insert({
    id: authData.user.id,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
  });

  if (userError) throw new Error(userError.message);

  // Add user to tenant
  const { error: tenantUserError } = await client.from("tenantUsers").insert({
    userId: authData.user.id,
    tenantId: Number(tenantId),
  });

  if (tenantUserError) throw new Error(tenantUserError.message);

  // Create user roles
  if (userData.roleIds?.length) {
    // Make the first role primary by default
    const userRoles = userData.roleIds.map((roleId, index) => ({
      userId: authData.user.id,
      roleId,
      tenantId: Number(tenantId),
      isPrimary: index === 0, // First role is primary
    }));

    const { error: rolesError } = await client
      .from("userRoles")
      .insert(userRoles);

    if (rolesError) throw new Error(rolesError.message);
  }

  // Fetch the created user with roles
  const { data: user, error: fetchError } = await client
    .from("users")
    .select(
      `
      *,
      roles:userRoles(
        id,
        roleId,
        tenantId,
        isPrimary,
        role:roles(
          id,
          name,
          domain,
          permissions,
          tenantId
        )
      )
    `
    )
    .eq("id", authData.user.id)
    .single();

  if (fetchError || !user)
    throw new Error(fetchError?.message ?? "Failed to fetch created user");

  return UserSchema.parse({
    ...user,
    roles: user.roles || [],
  });
};

// Update user and their roles
export const updateUser = async (
  client: TypedClient,
  userId: string,
  userData: UserUpdateForm,
  tenantId: string
) => {
  const adminClient = getAdminClient();

  // Update auth email if changed using admin client
  if (userData.email) {
    const { error: authError } = await adminClient.auth.admin.updateUserById(
      userId,
      { email: userData.email }
    );
    if (authError) throw new Error(authError.message);
  }

  // Update user profile
  const { error: userError } = await client
    .from("users")
    .update({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
    })
    .eq("id", userId);

  if (userError) throw new Error(userError.message);

  // Update user roles if provided
  if (userData.roleIds) {
    // First get existing roles to preserve primary status
    const { data: existingRoles } = await client
      .from("userRoles")
      .select("roleId, isPrimary")
      .eq("userId", userId)
      .eq("tenantId", Number(tenantId));

    // Delete existing roles for this tenant
    const { error: deleteError } = await client
      .from("userRoles")
      .delete()
      .eq("userId", userId)
      .eq("tenantId", Number(tenantId));

    if (deleteError) throw new Error(deleteError.message);

    // Then insert new roles if any
    if (userData.roleIds.length > 0) {
      const userRoles = userData.roleIds.map((roleId) => {
        // Check if this role was primary before
        const existingRole = existingRoles?.find((r) => r.roleId === roleId);
        return {
          userId,
          roleId,
          tenantId: Number(tenantId),
          isPrimary: existingRole?.isPrimary ?? false,
        };
      });

      // Ensure at least one role is primary
      if (!userRoles.some((role) => role.isPrimary)) {
        userRoles[0].isPrimary = true;
      }

      const { error: rolesError } = await client
        .from("userRoles")
        .insert(userRoles);

      if (rolesError) throw new Error(rolesError.message);
    }
  }

  // Fetch the updated user with roles
  const { data: user, error: fetchError } = await client
    .from("users")
    .select(
      `
      *,
      roles:userRoles(
        id,
        roleId,
        tenantId,
        isPrimary,
        role:roles(
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

  if (fetchError || !user)
    throw new Error(fetchError?.message ?? "Failed to fetch updated user");

  return UserSchema.parse({
    ...user,
    roles: user.roles || [],
  });
};

// Check if user has access to tenant
export const checkTenantUserByIds = async (
  client: TypedClient,
  tenantId: string,
  userId: string
) => {
  const { data, error } = await client
    .from("tenantUsers")
    .select("id")
    .eq("userId", userId)
    .eq("tenantId", tenantId)
    .single();

  if (error) {
    console.error("Error checking tenant user:", error);
    return false;
  }

  return !!data;
};

// Delete user (this will cascade delete their entities)
export const deleteUser = async (
  client: TypedClient,
  userId: string,
  tenantId: string
) => {
  // First remove user from tenant
  const { error: tenantUserError } = await client
    .from("tenantUsers")
    .delete()
    .eq("userId", userId)
    .eq("tenantId", Number(tenantId));

  if (tenantUserError) throw new Error(tenantUserError.message);

  // Then delete user roles for this tenant
  const { error: rolesError } = await client
    .from("userRoles")
    .delete()
    .eq("userId", userId)
    .eq("tenantId", Number(tenantId));

  if (rolesError) throw new Error(rolesError.message);

  // Check if user exists in any other tenants
  const { data: otherTenants, error: tenantsError } = await client
    .from("tenantUsers")
    .select("id")
    .eq("userId", userId);

  if (tenantsError) throw new Error(tenantsError.message);

  // Only delete the user completely if they don't belong to any other tenants
  if (!otherTenants?.length) {
    const adminClient = getAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
  }

  return true;
};

export const getUsersByEmail = async (client: TypedClient, email: string) => {
  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "User not found");
  }

  return UserSchema.parse(data);
};
