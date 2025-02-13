import { TypedClient } from "@/libs/supabase/type";
import {
  Role,
  RoleForm,
  RoleSchema,
  UserDomain,
  UserDomainSchema,
  UserDomainWithRoles,
} from "./Role.schema";

// Get all roles for a specific domain and tenant type
export const getRolesByDomainAndTenantType = async (
  client: TypedClient,
  domain: string,
  tenantType?: string
): Promise<Role[]> => {
  let query = client.from("roles").select("*").eq("domain", domain);

  if (tenantType) {
    query = query.eq("tenantType", tenantType);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data.map((role) => RoleSchema.parse(role));
};

// Get user domains with roles for a specific user
export const getUserDomainsWithRoles = async (
  client: TypedClient,
  userId: string
): Promise<UserDomainWithRoles[]> => {
  const { data, error } = await client
    .from("userDomains")
    .select(
      `
      *,
      roles:userDomainRoles(
        role:roles(*)
      )
    `
    )
    .eq("userId", userId);

  if (error) throw new Error(error.message);

  return data.map((ud) => ({
    ...UserDomainSchema.parse(ud),
    roles: ud.roles.map((r: any) => RoleSchema.parse(r.role)),
  }));
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
  roleId: string,
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
  roleId: string
): Promise<void> => {
  const { error } = await client.from("roles").delete().eq("id", roleId);
  if (error) throw new Error(error.message);
};

// Assign a role to a user domain
export const assignRoleToUserDomain = async (
  client: TypedClient,
  userDomainId: number,
  roleId: string
): Promise<void> => {
  const { error } = await client.from("userDomainRoles").insert({
    userDomainId,
    roleId,
  });

  if (error) throw new Error(error.message);
};

// Remove a role from a user domain
export const removeRoleFromUserDomain = async (
  client: TypedClient,
  userDomainId: number,
  roleId: string
): Promise<void> => {
  const { error } = await client
    .from("userDomainRoles")
    .delete()
    .eq("userDomainId", userDomainId)
    .eq("roleId", roleId);

  if (error) throw new Error(error.message);
};

// Create a user domain
export const createUserDomain = async (
  client: TypedClient,
  userId: string,
  tenantId: number,
  domain: string,
  isPrimary: boolean = false,
  teamId?: number
): Promise<UserDomain> => {
  const { data, error } = await client
    .from("userDomains")
    .insert({
      userId,
      tenantId,
      domain,
      isPrimary,
      teamId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return UserDomainSchema.parse(data);
};
