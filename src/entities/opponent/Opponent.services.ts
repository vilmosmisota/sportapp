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
      teams:opponentTeams(
        team:teams(
          id,
          age,
          gender,
          skill,
          tenantId
        )
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
      teams: opponent.teams?.map((t: any) => t.team) || null,
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
      teams:opponentTeams(
        team:teams(
          id,
          age,
          gender,
          skill,
          tenantId
        )
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
    teams: data.teams?.map((t: any) => t.team) || null,
  });
};

export const createOpponent = async (
  client: TypedClient,
  data: OpponentForm,
  tenantId: string
): Promise<Opponent> => {
  const { teamIds, teams, ...opponentData } = data;

  // Start a transaction
  const { data: opponent, error: opponentError } = await client
    .from("opponents")
    .insert({ ...opponentData, tenantId: Number(tenantId) })
    .select()
    .single();

  if (opponentError) {
    throw new Error(opponentError.message);
  }

  // If we have teams data, create opponent teams and connections
  if (teams && teams.length > 0) {
    // Create new opponent teams with the age, gender, and skill data
    const opponentTeamsToCreate = teams.map((team) => ({
      age: team.age,
      gender: team.gender,
      skill: team.skill,
      isOpponent: true,
      tenantId: Number(tenantId),
    }));

    const { data: createdTeams, error: createTeamsError } = await client
      .from("teams")
      .insert(opponentTeamsToCreate)
      .select();

    if (createTeamsError) {
      throw new Error(createTeamsError.message);
    }

    // Create the junction table entries with the newly created opponent teams
    const opponentTeams = createdTeams.map((team) => ({
      opponentId: opponent.id,
      teamId: team.id,
      tenantId: Number(tenantId),
    }));

    const { error: junctionError } = await client
      .from("opponentTeams")
      .insert(opponentTeams);

    if (junctionError) {
      throw new Error(junctionError.message);
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
  const { teamIds, ...opponentData } = data;

  // Update opponent data
  const { error: opponentError } = await client
    .from("opponents")
    .update(opponentData)
    .eq("id", opponentId)
    .eq("tenantId", tenantId);

  if (opponentError) {
    throw new Error(opponentError.message);
  }

  // If teamIds is provided, update the junction table
  if (teamIds !== undefined) {
    // First, delete all existing connections
    const { error: deleteError } = await client
      .from("opponentTeams")
      .delete()
      .eq("opponentId", opponentId)
      .eq("tenantId", tenantId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    // Then, if we have new team IDs, create new connections
    if (teamIds && teamIds.length > 0) {
      const opponentTeams = teamIds.map((teamId) => ({
        opponentId,
        teamId,
        tenantId: Number(tenantId),
      }));

      const { error: insertError } = await client
        .from("opponentTeams")
        .insert(opponentTeams);

      if (insertError) {
        throw new Error(insertError.message);
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
  // The junction table entries will be automatically deleted due to the CASCADE constraint
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
