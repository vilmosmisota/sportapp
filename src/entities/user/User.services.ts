import { TypedClient } from "@/libs/supabase/type";
import { UserSchema } from "./User.schema";

export const getUserOnClient = async (typedClient: TypedClient) => {
  const {
    data: { user },
  } = await typedClient.auth.getUser();

  if (!user) {
    return;
  }

  return user;
};

export const getUsersByEmail = async (
  typedClient: TypedClient,
  email: string
) => {
  const { data, error } = await typedClient
    .from("users")
    .select("*")
    .eq("email", `${email}`)
    .single();

  if (error || !data) {
    throw new Error(error.message);
  }

  const validatedData = UserSchema.parse(data);

  return validatedData;
};

export const checkTenantUserByIds = async (
  typedClient: TypedClient,
  tenantId: string,
  userId: string
) => {
  const { data: tenantData } = await typedClient
    .from("userEntities")
    .select("tenantId")
    .eq("userId", `${userId}`)
    .eq("tenantId", `${tenantId}`)
    .single();

  if (tenantData) {
    return true;
  }
  return false;
};
