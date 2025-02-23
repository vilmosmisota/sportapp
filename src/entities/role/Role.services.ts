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
  tenantId: number
): Promise<void> => {
  const { error } = await client.from("userRoles").insert({
    userId,
    roleId,
    tenantId,
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
