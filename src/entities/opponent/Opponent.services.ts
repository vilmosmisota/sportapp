import { TypedClient } from "@/libs/supabase/type";
import {
  OpponentSchema,
  type Opponent,
  type OpponentForm,
} from "./Opponent.schema";

export const getOpponentsByTenantId = async (
  client: TypedClient,
  tenantId: string
): Promise<Opponent[]> => {
  const { data, error } = await client
    .from("opponents")
    .select(
      `
      *,
      teams:teams(
        id,
        age,
        gender,
        skill,
        tenantId,
        appearance
      )
    `
    )
    .eq("tenantId", tenantId);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((opponent) =>
    OpponentSchema.parse({
      ...opponent,
      teams: opponent.teams || null,
    })
  );
};

export const getOpponentById = async (
  client: TypedClient,
  opponentId: number,
  tenantId: string
): Promise<Opponent> => {
  const { data, error } = await client
    .from("opponents")
    .select(
      `
      *,
      teams:teams(
        id,
        age,
        gender,
        skill,
        tenantId,
        appearance
      )
    `
    )
    .eq("id", opponentId)
    .eq("tenantId", tenantId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return OpponentSchema.parse({
    ...data,
    teams: data.teams || null,
  });
};

export const createOpponent = async (
  client: TypedClient,
  data: OpponentForm,
  tenantId: string
): Promise<Opponent> => {
  const { teams, teamIds, ...opponentData } = data;

  // Start a transaction
  const { data: opponent, error: opponentError } = await client
    .from("opponents")
    .insert({ ...opponentData, tenantId: Number(tenantId) })
    .select()
    .single();

  if (opponentError) {
    throw new Error(opponentError.message);
  }

  // If we have teams data, create teams linked to this opponent
  if (teams && teams.length > 0) {
    // Create new teams with the opponent_id set
    const teamsToCreate = teams.map((team) => ({
      age: team.age,
      gender: team.gender,
      skill: team.skill,
      opponentId: opponent.id,
      tenantId: Number(tenantId),
      appearance: team.appearance,
    }));

    const { error: createTeamsError } = await client
      .from("teams")
      .insert(teamsToCreate);

    if (createTeamsError) {
      throw new Error(createTeamsError.message);
    }
  }

  // Fetch the complete opponent data with teams
  return getOpponentById(client, opponent.id, tenantId);
};

export const updateOpponent = async (
  client: TypedClient,
  opponentId: number,
  data: Partial<OpponentForm>,
  tenantId: string
): Promise<Opponent> => {
  const { teamIds, teams, ...opponentData } = data;

  // Update opponent data
  const { error: opponentError } = await client
    .from("opponents")
    .update(opponentData)
    .eq("id", opponentId)
    .eq("tenantId", tenantId);

  if (opponentError) {
    throw new Error(opponentError.message);
  }

  // If teams data is provided, update the teams
  if (teams !== undefined) {
    // First, get existing teams for this opponent
    const { data: existingTeams, error: getTeamsError } = await client
      .from("teams")
      .select("id")
      .eq("opponentId", opponentId)
      .eq("tenantId", tenantId);

    if (getTeamsError) {
      throw new Error(getTeamsError.message);
    }

    // Delete all existing teams for this opponent
    if (existingTeams.length > 0) {
      const { error: deleteTeamsError } = await client
        .from("teams")
        .delete()
        .eq("opponentId", opponentId)
        .eq("tenantId", tenantId);

      if (deleteTeamsError) {
        throw new Error(deleteTeamsError.message);
      }
    }

    // Create new teams if provided
    if (teams && teams.length > 0) {
      const teamsToCreate = teams.map((team) => ({
        age: team.age,
        gender: team.gender,
        skill: team.skill,
        opponentId: opponentId,
        tenantId: Number(tenantId),
        appearance: team.appearance,
      }));

      const { error: createTeamsError } = await client
        .from("teams")
        .insert(teamsToCreate);

      if (createTeamsError) {
        throw new Error(createTeamsError.message);
      }
    }
  }

  // Fetch and return the updated opponent with teams
  return getOpponentById(client, opponentId, tenantId);
};

export const deleteOpponent = async (
  client: TypedClient,
  opponentId: number,
  tenantId: string
): Promise<boolean> => {
  // First delete any associated teams
  const { error: deleteTeamsError } = await client
    .from("teams")
    .delete()
    .eq("opponentId", opponentId)
    .eq("tenantId", tenantId);

  if (deleteTeamsError) {
    throw new Error(deleteTeamsError.message);
  }

  // Then delete the opponent
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
