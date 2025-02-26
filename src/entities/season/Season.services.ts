import { TypedClient } from "@/libs/supabase/type";
import { SeasonForm, SeasonSchema } from "./Season.schema";

export const getSeasonsByTenantId = async (
  tenantId: string,
  typedClient: TypedClient
) => {
  const { data, error } = await typedClient
    .from("seasons")
    .select("*")
    .eq("tenantId", tenantId);

  if (error) {
    throw new Error(error.message);
  }

  const validatedData = data.map((season) => SeasonSchema.parse(season));

  return validatedData;
};

export const updateSeasonById = async (
  client: TypedClient,
  data: Partial<SeasonForm>,
  seasonId: string
) => {
  const { data: season, error: seasonError } = await client
    .from("seasons")
    .update({
      startDate: data.startDate,
      endDate: data.endDate,
      breaks: data.breaks,
      customName: data.customName,
      isActive: data.isActive,
      phases: data.phases,
    })
    .eq("id", seasonId)
    .select()
    .single();

  if (seasonError) {
    throw new Error(seasonError.message);
  }

  return season;
};

export const addSeasonById = async (
  client: TypedClient,
  data: SeasonForm,
  tenantId: string
) => {
  const { data: season, error: seasonError } = await client
    .from("seasons")
    .insert({
      startDate: data.startDate,
      endDate: data.endDate,
      breaks: data.breaks,
      customName: data.customName,
      isActive: data.isActive,
      phases: data.phases,
      tenantId,
    })
    .select()
    .single();

  if (seasonError) {
    throw new Error(seasonError.message);
  }

  return season;
};

export const deleteSeasonById = async (
  client: TypedClient,
  seasonId: string,
  tenantId: string
) => {
  // Delete the season
  const { error } = await client
    .from("seasons")
    .delete()
    .eq("id", seasonId)
    .eq("tenantId", tenantId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};
