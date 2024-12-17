import { TypedClient } from "@/libs/supabase/type";
import { TeamForm, TeamSchema } from "./Team.schema";

export const getTeamsByTenantId = async (
  typedClient: TypedClient,
  tenantId: string
) => {
  const { data, error } = await typedClient
    .from("teams")
    .select("*")
    .eq("tenantId", `${tenantId}`);

  if (error) {
    throw new Error(error.message);
  }
  const validatedData = data.map((team) => TeamSchema.parse(team));

  return validatedData;
};

export const addTeamToTenant = async (
  client: TypedClient,
  data: TeamForm,
  tenantId: string
) => {
  const { data: team, error } = await client
    .from("teams")
    .insert({ ...data, tenantId: Number(tenantId) })
    .eq("tenantId", `${tenantId}`)
    .select();

  console.log("error", error?.message);

  if (error) {
    throw new Error(error.message);
  }

  return team;
};
