import { TypedClient } from "@/libs/supabase/type";
import { CoachForm, CoachSchema } from "./Coach.schema";



export const getCoachesByTenantId = async (
  typedClient: TypedClient,
  tenantId: string
) => {
  const { data, error } = await typedClient
    .from("coaches")
    .select("*")
    .eq("tenantId", `${tenantId}`);

  if (error) {
    throw new Error(error.message);
  }

  const validatedData = data.map((coach) => CoachSchema.parse(coach));
  return validatedData;
};

export const addCoach = async (
  client: TypedClient,
  data: CoachForm,
  tenantId: string
) => {
  const { data: coach, error } = await client
    .from("coaches")
    .insert({ ...data, tenantId: Number(tenantId) })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return CoachSchema.parse(coach);
};

export const updateCoach = async (
  client: TypedClient,
  data: CoachForm,
  coachId: string,
  tenantId: string
) => {
  const { data: coach, error } = await client
    .from("coaches")
    .update({ ...data })
    .eq("id", coachId)
    .eq("tenantId", tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return CoachSchema.parse(coach);
};

export const deleteCoach = async (
  client: TypedClient,
  coachId: string,
  tenantId: string
) => {
  const { error } = await client
    .from("coaches")
    .delete()
    .eq("id", coachId)
    .eq("tenantId", tenantId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};
