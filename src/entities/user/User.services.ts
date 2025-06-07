import { TypedClient } from "@/libs/supabase/type";
import { User, UserMember, UserMemberSchema, UserSchema } from "./User.schema";

export const getCurrentUserByTenantId = async (
  client: TypedClient,
  tenantId: string
): Promise<User> => {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await client
    .from("tenantUsers")
    .select(
      `
      id,
      tenantId,
      userId,
      roleId,
      role:roles(
        id,
        name,
        permissions,
        access,
        tenantId
      ),
      user:users(
        id,
        email
      )
    `
    )
    .eq("tenantId", Number(tenantId))
    .eq("userId", user.id)
    .single();

  if (error || !data)
    throw new Error(error?.message ?? "User not found in tenant");

  return UserSchema.parse(data);
};

export const getUsersByTenantId = async (
  client: TypedClient,
  tenantId: string
): Promise<UserMember[]> => {
  const { data, error } = await client
    .from("tenantUsers")
    .select(
      `
      id,
      tenantId,
      userId,
      roleId,
      role:roles(
        id,
        name,
        permissions,
        access,
        tenantId
      ),
      user:users(
        id,
        email
      ),
      member:members!tenantUserId(
        id,
        createdAt,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        memberType,
        pin,
        tenantUserId
      )
    `
    )
    .eq("tenantId", Number(tenantId));

  if (error) throw new Error(error.message);

  return data.map((user) => UserMemberSchema.parse(user));
};

// CRUD are in api: /api/users - as it needs AUTH client
