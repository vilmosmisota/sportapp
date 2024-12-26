import { TypedClient } from "@/libs/supabase/type";
import {
  PlayerTeamConnectionForm,
  PlayerTeamConnectionSchema,
} from "./PlayerTeam.schema";

export const getPlayerTeamConnections = async (
  client: TypedClient,
  tenantId: string,
  filters?: { playerId?: number; teamId?: number }
) => {
  let query = client
    .from("playerTeamConnections")
    .select(
      `
      *,
      player:players(*),
      team:teams(*)
    `
    )
    .eq("tenantId", tenantId);

  if (filters?.playerId) {
    query = query.eq("playerId", filters.playerId);
  }

  if (filters?.teamId) {
    query = query.eq("teamId", filters.teamId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data.map((connection) => PlayerTeamConnectionSchema.parse(connection));
};

export const addPlayerToTeam = async (
  client: TypedClient,
  data: PlayerTeamConnectionForm,
  tenantId: string
) => {
  const { data: connection, error } = await client
    .from("playerTeamConnections")
    .insert([{ ...data, tenantId: Number(tenantId) }])
    .select(
      `
      *,
      player:players(*),
      team:teams(*)
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return PlayerTeamConnectionSchema.parse(connection);
};

export const removePlayerFromTeam = async (
  client: TypedClient,
  playerId: number,
  teamId: number,
  tenantId: string
) => {
  const { error } = await client
    .from("playerTeamConnections")
    .delete()
    .eq("playerId", playerId)
    .eq("teamId", teamId)
    .eq("tenantId", Number(tenantId));

  if (error) {
    throw new Error(error.message);
  }

  return true;
};
