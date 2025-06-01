import { getAdminClient } from "@/libs/supabase/admin";
import { TypedClient } from "@/libs/supabase/type";
import {
  UserForm,
  UserMember,
  UserMemberSchema,
  UserSchema,
  UserUpdateForm,
} from "./User.schema";

export const getCurrentUser = async (client: TypedClient) => {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await client
    .from("users")
    .select(
      `
      *,
      tenantUsers(id, tenantId, userId),
      role:roles(
        id,
        name,
        permissions,
        tenantId
      )
    `
    )
    .eq("id", user.id)
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to fetch user");

  return UserSchema.parse(data);
};

export const getUsersByTenantId = async (
  client: TypedClient,
  tenantId: string
): Promise<UserMember[]> => {
  const { data, error } = await client
    .from("users")
    .select(
      `
      *,
      tenantUsers!inner(id, tenantId, userId),
      role:roles(
        id,
        name,
        permissions,
        tenantId
      ),
      member:members(
        id,
        createdAt,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        memberType,
        userId,
        tenantId
      )
    `
    )
    .eq("tenantUsers.tenantId", Number(tenantId));

  if (error) throw new Error(error.message);

  return data.map((user) =>
    UserMemberSchema.parse({
      ...user,
      member: user.member?.[0] || null,
    })
  );
};

export const createUser = async (
  client: TypedClient,
  userData: UserForm,
  tenantId: string
) => {
  const adminClient = getAdminClient();

  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    });

  if (authError) throw new Error(authError.message);

  const { error: userError } = await client.from("users").insert({
    id: authData.user.id,
    email: userData.email,
    roleId: userData.roleId,
    userDomains: userData.userDomains || [],
  });

  if (userError) throw new Error(userError.message);

  const { error: tenantUserError } = await client.from("tenantUsers").insert({
    userId: authData.user.id,
    tenantId: Number(tenantId),
  });

  if (tenantUserError) throw new Error(tenantUserError.message);

  if (userData.memberType) {
    const { error: memberError } = await client.from("members").insert({
      firstName: userData.firstName,
      lastName: userData.lastName,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      memberType: userData.memberType,
      userId: authData.user.id,
      tenantId: Number(tenantId),
    });

    if (memberError) throw new Error(memberError.message);
  }

  return { id: authData.user.id };
};

export const updateUser = async (
  client: TypedClient,
  userId: string,
  userData: UserUpdateForm,
  tenantId: string
) => {
  const adminClient = getAdminClient();

  if (userData.email) {
    const { error: authError } = await adminClient.auth.admin.updateUserById(
      userId,
      { email: userData.email }
    );
    if (authError) throw new Error(authError.message);
  }

  const { error: userError } = await client
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
    const { data: existingMember, error: memberCheckError } = await client
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
      const { error: memberError } = await client
        .from("members")
        .update(memberData)
        .eq("id", existingMember.id);

      if (memberError) throw new Error(memberError.message);
    } else {
      // Insert new member
      const { error: memberError } = await client
        .from("members")
        .insert(memberData);

      if (memberError) throw new Error(memberError.message);
    }
  }

  return { id: userId };
};

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

export const deleteUser = async (
  client: TypedClient,
  userId: string,
  tenantId: string
) => {
  await client
    .from("members")
    .delete()
    .eq("userId", userId)
    .eq("tenantId", Number(tenantId));

  const { error: tenantUserError } = await client
    .from("tenantUsers")
    .delete()
    .eq("userId", userId)
    .eq("tenantId", Number(tenantId));

  if (tenantUserError) throw new Error(tenantUserError.message);

  const { data: otherTenants, error: tenantsError } = await client
    .from("tenantUsers")
    .select("id")
    .eq("userId", userId);

  if (tenantsError) throw new Error(tenantsError.message);

  if (!otherTenants?.length) {
    const adminClient = getAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
  }

  return true;
};
