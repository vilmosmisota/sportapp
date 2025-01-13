import { TypedClient } from "@/libs/supabase/type";
import { SeasonForm, SeasonSchema } from "./Season.schema";

export const getSeasonsByTenantId = async (
  tenantId: string,
  typedClient: TypedClient
) => {
  const { data, error } = await typedClient
    .from("seasons")
    .select(
      `
      *,
      membershipPrices:seasonMembershipPrices(
        *,
        membershipCategory:membershipCategories(*)
      )
    `
    )
    .eq("tenantId", tenantId);

  if (error) {
    throw new Error(error.message);
  }

  const validatedData = data.map((season) => SeasonSchema.parse(season));
  console.log("validatedData", validatedData);
  return validatedData;
};

export const updateSeasonById = async (
  client: TypedClient,
  data: Partial<SeasonForm>,
  seasonId: string
) => {
  // Start a Supabase transaction
  const { data: season, error: seasonError } = await client
    .from("seasons")
    .update({
      startDate: data.startDate,
      endDate: data.endDate,
      breaks: data.breaks,
      customName: data.customName,
    })
    .eq("id", seasonId)
    .select()
    .single();

  if (seasonError) {
    throw new Error(seasonError.message);
  }

  // If there are membership prices to update
  if (data.membershipPrices && data.membershipPrices.length > 0) {
    // First, delete existing prices for this season
    const { error: deleteError } = await client
      .from("seasonMembershipPrices")
      .delete()
      .eq("seasonId", seasonId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    // Then insert new prices
    const { error: insertError } = await client
      .from("seasonMembershipPrices")
      .insert(
        data.membershipPrices.map((price) => ({
          seasonId: Number(seasonId),
          membershipCategoryId: price.membershipCategoryId,
          price: price.price,
        }))
      );

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  return season;
};

export const addSeasonById = async (
  client: TypedClient,
  data: SeasonForm,
  tenantId: string
) => {
  // First create the season
  const { data: season, error } = await client
    .from("seasons")
    .insert({
      tenantId: Number(tenantId),
      startDate: data.startDate,
      endDate: data.endDate,
      breaks: data.breaks || [],
      customName: data.customName,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // If there are membership prices, insert them
  if (data.membershipPrices && data.membershipPrices.length > 0) {
    const { error: pricesError } = await client
      .from("seasonMembershipPrices")
      .insert(
        data.membershipPrices.map((price) => ({
          seasonId: season.id,
          membershipCategoryId: price.membershipCategoryId,
          price: price.price,
        }))
      );

    if (pricesError) {
      throw new Error(pricesError.message);
    }
  }

  return SeasonSchema.parse(season);
};

export const deleteSeasonById = async (
  client: TypedClient,
  seasonId: string,
  tenantId: string
) => {
  // First delete related membership prices
  const { error: pricesError } = await client
    .from("seasonMembershipPrices")
    .delete()
    .eq("seasonId", seasonId);

  if (pricesError) {
    throw new Error(pricesError.message);
  }

  // Then delete the season
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
