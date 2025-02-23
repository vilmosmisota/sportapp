import { TypedClient } from "@/libs/supabase/type";
import {
  Role,
  RoleForm,
  RoleSchema,
  UserRole,
  UserRoleSchema,
  UserWithRoles,
} from "./Role.schema";

// Get all roles for a tenant (including global roles)
export const getRolesByTenant = async (
  client: TypedClient,
  tenantId?: number
): Promise<Role[]> => {
  const { data, error } = await client
    .from("roles")
    .select("*")
    .or(`tenantId.is.null,tenantId.eq.${tenantId}`);

  if (error) throw new Error(error.message);
  return data.map((role) => RoleSchema.parse(role));
};

// Get user roles for a specific user
export const getUserRoles = async (
  client: TypedClient,
  userId: string
): Promise<UserRole[]> => {
  const { data, error } = await client
    .from("userRoles")
    .select(
      `
      *,
      role:roles(*)
    `
    )
    .eq("userId", userId);

  if (error) throw new Error(error.message);

  return data.map((ur) => UserRoleSchema.parse(ur));
};

// Create a new role
export const createRole = async (
  client: TypedClient,
  roleData: RoleForm
): Promise<Role> => {
  const { data, error } = await client
    .from("roles")
    .insert(roleData)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return RoleSchema.parse(data);
};

// Update an existing role
export const updateRole = async (
  client: TypedClient,
  roleId: number,
  roleData: Partial<RoleForm>
): Promise<Role> => {
  const { data, error } = await client
    .from("roles")
    .update(roleData)
    .eq("id", roleId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return RoleSchema.parse(data);
};

// Delete a role
export const deleteRole = async (
  client: TypedClient,
  roleId: number
): Promise<void> => {
  const { error } = await client.from("roles").delete().eq("id", roleId);
  if (error) throw new Error(error.message);
};

// Assign a role to a user
export const assignRoleToUser = async (
  client: TypedClient,
  userId: string,
  roleId: number,
  tenantId: number,
  isPrimary: boolean = false
): Promise<void> => {
  const { error } = await client.from("userRoles").insert({
    userId,
    roleId,
    tenantId,
    isPrimary,
  });

  if (error) throw new Error(error.message);
};

// Remove a role from a user
export const removeRoleFromUser = async (
  client: TypedClient,
  userId: string,
  roleId: number,
  tenantId: number
): Promise<void> => {
  const { error } = await client
    .from("userRoles")
    .delete()
    .match({ userId, roleId, tenantId });

  if (error) throw new Error(error.message);
};

// Update primary status of a user role
export const updateUserRolePrimaryStatus = async (
  client: TypedClient,
  userId: string,
  roleId: number,
  tenantId: number,
  isPrimary: boolean
): Promise<void> => {
  // If setting as primary, first unset any existing primary roles for this user in this tenant
  if (isPrimary) {
    await client
      .from("userRoles")
      .update({ isPrimary: false })
      .match({ userId, tenantId, isPrimary: true });
  }

  // Update the specified role
  const { error } = await client
    .from("userRoles")
    .update({ isPrimary })
    .match({ userId, roleId, tenantId });

  if (error) throw new Error(error.message);
};

// Toggle primary status of a user role
export const toggleUserRolePrimary = async (
  client: TypedClient,
  roleId: number,
  tenantId: number,
  userId: string
): Promise<void> => {
  // Get current role status
  const { data: currentRole, error: fetchError } = await client
    .from("userRoles")
    .select("isPrimary")
    .match({ roleId, tenantId, userId })
    .single();

  if (fetchError) throw new Error(fetchError.message);

  // If setting as primary, first unset any existing primary roles for this user in this tenant
  if (!currentRole.isPrimary) {
    await client
      .from("userRoles")
      .update({ isPrimary: false })
      .match({ userId, tenantId, isPrimary: true });
  }

  // Toggle the primary status
  const { error } = await client
    .from("userRoles")
    .update({ isPrimary: !currentRole.isPrimary })
    .match({ roleId, tenantId, userId });

  if (error) throw new Error(error.message);
};

// Get user roles for a specific user in a tenant
export const getUserRolesByTenant = async (
  client: TypedClient,
  userId: string,
  tenantId: number
): Promise<UserRole[]> => {
  const { data, error } = await client
    .from("userRoles")
    .select(
      `
      *,
      role:roles(*)
    `
    )
    .match({ userId, tenantId });

  if (error) throw new Error(error.message);

  return data.map((ur) => UserRoleSchema.parse(ur));
};
