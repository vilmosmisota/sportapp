import { TypedClient } from "@/libs/supabase/type";
import { Role, RoleForm, RoleSchema } from "./Role.schema";

// Get all roles for a tenant (including global roles)
export const getRolesByTenant = async (
  client: TypedClient,
  tenantId: number
): Promise<Role[]> => {
  const { data, error } = await client
    .from("roles")
    .select("*")
    .eq("tenantId", tenantId);

  if (error) throw new Error(error.message);
  return data.map((role) => RoleSchema.parse(role));
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
