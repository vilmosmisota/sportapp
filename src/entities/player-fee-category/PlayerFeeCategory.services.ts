import { TypedClient } from "@/libs/supabase/type";
import {
  PlayerFeeCategoryForm,
  PlayerFeeCategorySchema,
} from "./PlayerFeeCategory.schema";

export const getPlayerFeeCategories = async (
  typedClient: TypedClient,
  tenantId: number
) => {
  const { data, error } = await typedClient
    .from("playerFeeCategories")
    .select("*")
    .eq("tenantId", `${tenantId}`);

  if (error) {
    throw new Error(error.message);
  }

  const validatedData = data.map((playerFeeCategory) =>
    PlayerFeeCategorySchema.parse(playerFeeCategory)
  );
  return validatedData;
};

export const addPlayerFeeCategory = async (
  client: TypedClient,
  data: PlayerFeeCategoryForm,
  tenantId: string
) => {
  const { data: playerFeeCategory, error } = await client
    .from("playerFeeCategories")
    .insert({ ...data, tenantId: Number(tenantId) })
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return playerFeeCategory;
};

export const updatePlayerFeeCategory = async (
  client: TypedClient,
  data: PlayerFeeCategoryForm,
  categoryId: string,
  tenantId: string
) => {
  const { data: playerFeeCategory, error } = await client
    .from("playerFeeCategories")
    .update({ ...data, tenantId: Number(tenantId), id: Number(categoryId) })
    .eq("id", categoryId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const validatedData = PlayerFeeCategorySchema.parse(playerFeeCategory);

  return validatedData;
};
