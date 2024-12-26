import { TypedClient } from "@/libs/supabase/type";
import {
  PlayerMembershipForm,
  PlayerMembershipSchema,
  SeasonMembershipPriceForm,
  SeasonMembershipPriceSchema,
} from "./PlayerMembership.schema";

export const getPlayerMembershipsByTenantId = async (
  client: TypedClient,
  tenantId: string,
  filters?: { playerId?: number; seasonId?: number }
) => {
  let query = client
    .from("playerMembership")
    .select(
      `
      *,
      player:players(*),
      season:seasons(*),
      membershipCategory:membershipCategories(*)
    `
    )
    .eq("tenantId", tenantId);

  if (filters?.playerId) {
    query = query.eq("playerId", filters.playerId);
  }

  if (filters?.seasonId) {
    query = query.eq("seasonId", filters.seasonId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data.map((membership) => PlayerMembershipSchema.parse(membership));
};

export const addPlayerMembership = async (
  client: TypedClient,
  data: PlayerMembershipForm
) => {
  const { data: membership, error } = await client
    .from("playerMembership")
    .insert([data])
    .select(
      `
      *,
      player:players(*),
      season:seasons(*),
      membershipCategory:membershipCategories(*)
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return PlayerMembershipSchema.parse(membership);
};

export const updatePlayerMembership = async (
  client: TypedClient,
  id: number,
  data: PlayerMembershipForm
) => {
  const { data: membership, error } = await client
    .from("playerMembership")
    .update(data)
    .eq("id", id)
    .select(
      `
      *,
      player:players(*),
      season:seasons(*),
      membershipCategory:membershipCategories(*)
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return PlayerMembershipSchema.parse(membership);
};

export const deletePlayerMembership = async (
  client: TypedClient,
  id: number
) => {
  const { error } = await client.from("playerMembership").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

// Season Membership Prices
export const getSeasonMembershipPricesByTenantId = async (
  client: TypedClient,
  tenantId: string,
  filters?: { seasonId?: number; membershipCategoryId?: number }
) => {
  let query = client
    .from("seasonMembershipPrices")
    .select(
      `
      *,
      season:seasons(*),
      membershipCategory:membershipCategories(*)
    `
    )
    .eq("tenantId", tenantId);

  if (filters?.seasonId) {
    query = query.eq("seasonId", filters.seasonId);
  }

  if (filters?.membershipCategoryId) {
    query = query.eq("membershipCategoryId", filters.membershipCategoryId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data.map((price) => SeasonMembershipPriceSchema.parse(price));
};

export const addSeasonMembershipPrice = async (
  client: TypedClient,
  data: SeasonMembershipPriceForm
) => {
  const { data: price, error } = await client
    .from("seasonMembershipPrices")
    .insert([data])
    .select(
      `
      *,
      season:seasons(*),
      membershipCategory:membershipCategories(*)
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return SeasonMembershipPriceSchema.parse(price);
};
