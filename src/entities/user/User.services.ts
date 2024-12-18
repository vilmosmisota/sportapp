import { TypedClient } from "@/libs/supabase/type";
import { User, UserForm, UserSchema } from "./User.schema";

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

// Get all users for a tenant with their entities
export const getUsersByTenantId = async (
  client: TypedClient,
  tenantId: string
): Promise<User[]> => {
  const { data, error } = await client
    .from("users")
    .select(
      `
      *,
      entities:userEntities (
        id,
        createdAt,
        entityName,
        role,
        tenantId,
        clubId,
        divisionId,
        teamId
      )
    `
    )
    .eq("userEntities.tenantId", tenantId);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((user) => UserSchema.parse(user));
};

// Create a new user with their entity
export const createUser = async (
  client: TypedClient,
  userData: UserForm,
  tenantId: string
) => {
  // First create the auth user with admin API
  const { data: authData, error: authError } =
    await client.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    });

  if (authError) throw new Error(authError.message);

  // Create user profile
  const { error: userError } = await client.from("users").insert({
    id: authData.user.id,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
  });

  if (userError) throw new Error(userError.message);

  // Create user entities
  const { data: entities, error: entityError } = await client
    .from("userEntities")
    .insert(
      userData.entities.map((entity) => ({
        ...entity,
        userId: authData.user.id,
        tenantId: Number(tenantId),
      }))
    )
    .select();

  if (entityError) throw new Error(entityError.message);

  return {
    id: authData.user.id,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    entities,
  };
};

// Update user and their entities
export const updateUser = async (
  client: TypedClient,
  userId: string,
  userData: UserForm,
  entityIds: number[],
  tenantId: string
) => {
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

  // Delete existing entities
  const { error: deleteError } = await client
    .from("userEntities")
    .delete()
    .in("id", entityIds);

  if (deleteError) throw new Error(deleteError.message);

  // Create new entities
  const { data: entities, error: entityError } = await client
    .from("userEntities")
    .insert(
      userData.entities.map((entity) => ({
        ...entity,
        userId,
        tenantId: Number(tenantId),
      }))
    )
    .select();

  if (entityError) throw new Error(entityError.message);

  return {
    id: userId,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    entities,
  };
};

// Delete user (this will cascade delete their entities)
export const deleteUser = async (client: TypedClient, userId: string) => {
  const { error } = await client.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  return true;
};

// Add this function back to User.services.ts
export const checkTenantUserByIds = async (
  client: TypedClient,
  tenantId: string,
  userId: string
) => {
  const { data, error } = await client
    .from("userEntities")
    .select("*")
    .eq("userId", userId)
    .eq("tenantId", tenantId);

  if (error) {
    console.error("Error checking tenant user:", error);
    return false;
  }

  return data && data.length > 0;
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