import { TypedClient } from "@/libs/supabase/type";
import { User, UserForm, UserSchema, UserUpdateForm } from "./User.schema";
import { getAdminClient } from "@/libs/supabase/admin";

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

// Get all users for a tenant with their entity
export const getUsersByTenantId = async (
  client: TypedClient,
  tenantId: string
): Promise<User[]> => {
  const { data, error } = await client
    .from("users")
    .select(
      `
      *,
      entity:userEntities!inner (
        id,
        createdAt,
        adminRole,
        domainRole,
        tenantId,
        clubId,
        divisionId,
        teamId
      )
    `
    )
    .eq("userEntities.tenantId", tenantId);

  if (error) throw new Error(error.message);

  return data.map((user) => {
    const entity = Array.isArray(user.entity) ? user.entity[0] : user.entity;
    return UserSchema.parse({
      ...user,
      entity: entity || null,
    });
  });
};

// Create a new user with their entity
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

  // Create user entity
  const { data: entity, error: entityError } = await client
    .from("userEntities")
    .insert({
      userId: authData.user.id,
      tenantId: Number(tenantId),
      adminRole: userData.adminRole,
      domainRole: userData.domainRole,
      clubId: userData.clubId,
      divisionId: userData.divisionId,
      teamId: userData.teamId,
    })
    .select()
    .single();

  if (entityError) throw new Error(entityError.message);

  return {
    id: authData.user.id,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    entity,
  };
};

// Update user and their entity
export const updateUser = async (
  client: TypedClient,
  userId: string,
  userData: UserUpdateForm,
  entityId: number,
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

  // Update entity
  const { data: entity, error: entityError } = await client
    .from("userEntities")
    .update({
      adminRole: userData.adminRole,
      domainRole: userData.domainRole,
      clubId: userData.clubId,
      divisionId: userData.divisionId,
      teamId: userData.teamId,
    })
    .eq("id", entityId)
    .select()
    .single();

  if (entityError) throw new Error(entityError.message);

  return {
    id: userId,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    entity,
  };
};

// Check if user has access to tenant
export const checkTenantUserByIds = async (
  client: TypedClient,
  tenantId: string,
  userId: string
) => {
  const { data, error } = await client
    .from("userEntities")
    .select("*")
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
export const deleteUser = async (client: TypedClient, userId: string) => {
  const adminClient = getAdminClient();

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
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
