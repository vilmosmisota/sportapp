import { TypedClient } from "@/libs/supabase/type";
import { OpponentSchema, type Opponent } from "./Opponent.schema";

export const getOpponentsByTenantId = async (
  client: TypedClient,
  tenantId: string
): Promise<Opponent[]> => {
  const { data, error } = await client
    .from("opponents")
    .select("*")
    .eq("tenantId", tenantId);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((opponent) => OpponentSchema.parse(opponent));
};

export const getOpponentById = async (
  client: TypedClient,
  opponentId: number,
  tenantId: string
): Promise<Opponent> => {
  const { data, error } = await client
    .from("opponents")
    .select("*")
    .eq("id", opponentId)
    .eq("tenantId", tenantId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return OpponentSchema.parse(data);
};

export const createOpponent = async (
  client: TypedClient,
  data: Omit<Opponent, "id">,
  tenantId: string
): Promise<Opponent> => {
  const { data: opponent, error } = await client
    .from("opponents")
    .insert({ ...data, tenantId: Number(tenantId) })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return OpponentSchema.parse(opponent);
};

export const updateOpponent = async (
  client: TypedClient,
  opponentId: number,
  data: Partial<Omit<Opponent, "id">>,
  tenantId: string
): Promise<Opponent> => {
  const { data: opponent, error } = await client
    .from("opponents")
    .update(data)
    .eq("id", opponentId)
    .eq("tenantId", tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return OpponentSchema.parse(opponent);
};

export const deleteOpponent = async (
  client: TypedClient,
  opponentId: number,
  tenantId: string
): Promise<boolean> => {
  const { error } = await client
    .from("opponents")
    .delete()
    .eq("id", opponentId)
    .eq("tenantId", tenantId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};
