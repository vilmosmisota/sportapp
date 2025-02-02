import { TypedClient } from "@/libs/supabase/type";
import {
  TeamForm,
  TeamSchema,
  PlayerTeamConnectionSchema,
} from "./Team.schema";
import { PlayerSchema } from "../player/Player.schema";

export const getTeamsByTenantId = async (
  typedClient: TypedClient,
  tenantId: string
) => {
  const { data, error } = await typedClient
    .from("teams")
    .select(
      `
      *,
      playerTeamConnections:playerTeamConnections(
        id,
        player:players(
          id,
          firstName,
          lastName,
          dateOfBirth,
          position,
          gender
        )
      ),
      coach:userEntities!teamId (
        user:users (
          id,
          firstName,
          lastName
        )
      )
    `
    )
    .eq("tenantId", tenantId);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((team) =>
    TeamSchema.parse({
      ...team,
      coach: team.coach?.[0]?.user || null,
      playerTeamConnections: team.playerTeamConnections || [],
    })
  );
};

export const getCoachesByTenantId = async (
  client: TypedClient,
  tenantId: string
) => {
  const { data, error } = await client
    .from("userEntities")
    .select(
      `
      userId,
      user:users (
        id,
        firstName,
        lastName
      )
    `
    )
    .eq("tenantId", tenantId)
    .eq("domainRole", "coach");

  if (error) throw new Error(error.message);

  return data
    .filter((entity) => entity.user)
    .map((entity) => ({
      id: entity.user!.id,
      firstName: entity.user!.firstName,
      lastName: entity.user!.lastName,
    }));
};

export const addTeamToTenant = async (
  client: TypedClient,
  data: TeamForm,
  tenantId: string
) => {
  const { data: team, error } = await client
    .from("teams")
    .insert({ ...data, tenantId: Number(tenantId) })
    .select(
      `
      *,
      coach:userEntities!teamId (
        user:users (
          id,
          firstName,
          lastName
        )
      )
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return TeamSchema.parse({
    ...team,
    coach: team.coach?.[0]?.user || null,
  });
};

export const updateTeam = async (
  client: TypedClient,
  data: TeamForm,
  teamId: number,
  tenantId: string
) => {
  const { data: team, error } = await client
    .from("teams")
    .update({ ...data })
    .eq("id", teamId)
    .eq("tenantId", tenantId)
    .select(
      `
      *,
      coach:userEntities!teamId (
        user:users (
          id,
          firstName,
          lastName
        )
      )
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return TeamSchema.parse({
    ...team,
    coach: team.coach?.[0]?.user || null,
  });
};

export const deleteTeam = async (
  client: TypedClient,
  teamId: number,
  tenantId: string
) => {
  const { error } = await client
    .from("teams")
    .delete()
    .eq("id", teamId)
    .eq("tenantId", Number(tenantId));

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

export const getTeamPlayers = async (
  client: TypedClient,
  teamId: number,
  tenantId: string
) => {
  const { data, error } = await client
    .from("playerTeamConnections")
    .select(
      `
      id,
      player:players!inner (
        id,
        firstName,
        lastName,
        dateOfBirth,
        position,
        gender,
        pin
      )
    `
    )
    .eq("teamId", teamId)
    .eq("tenantId", tenantId);

  if (error) {
    throw new Error(error.message);
  }
};

export const getPlayersByTeamId = async (
  client: TypedClient,
  teamId: number,
  tenantId: string
) => {
  const { data, error } = await client
    .from("playerTeamConnections")
    .select(
      `
      id,
      player:players!inner (
        id,
        firstName,
        lastName,
        dateOfBirth,
        position,
        gender,
        pin
      )
    `
    )
    .eq("teamId", teamId)
    .eq("tenantId", tenantId);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((connection) => PlayerTeamConnectionSchema.parse(connection));
};
