import { TypedClient } from "@/libs/supabase/type";
import { PlayerForm, PlayerSchema } from "./Player.schema";
import { z } from "zod";

const PLAYER_QUERY_WITH_RELATIONS = `
  *,
  teamConnections:playerTeamConnections!left(
    *,
    team:teams(*)
  ),
  userConnections:playerUserConnections!left(
    *,
    user:users(
      id,
      email,
      firstName,
      lastName,
      roles:userRoles(
        id,
        roleId,
        tenantId,
        role:roles(
          id,
          name,
          domain,
          permissions,
          tenantId
        )
      )
    )
  )
`;

const getPlayerWithRelations = async (
  client: TypedClient,
  playerId: number
) => {
  const { data, error } = await client
    .from("players")
    .select(PLAYER_QUERY_WITH_RELATIONS)
    .eq("id", playerId)
    .single();

  if (error) throw error;
  return PlayerSchema.parse(data);
};

export const getPlayersByTenantId = async (
  typedClient: TypedClient,
  tenantId: string
) => {
  const { data: players, error } = await typedClient
    .from("players")
    .select(PLAYER_QUERY_WITH_RELATIONS)
    .eq("tenantId", tenantId)
    .order("firstName", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return players.map((player) => PlayerSchema.parse(player));
};

export const addPlayerToTenant = async (
  client: TypedClient,
  data: PlayerForm,
  tenantId: string
) => {
  try {
    const { teamIds, parentUserIds, ownerUserId, ...playerData } = data;

    // Insert the player
    const { data: newPlayer, error: insertError } = await client
      .from("players")
      .insert({
        ...playerData,
        tenantId: Number(tenantId),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Add team connections if provided
    if (teamIds?.length) {
      const teamConnections = teamIds.map((teamId) => ({
        playerId: newPlayer.id,
        teamId,
        tenantId: Number(tenantId),
      }));

      const { error: teamError } = await client
        .from("playerTeamConnections")
        .insert(teamConnections);

      if (teamError) throw teamError;
    }

    // Create user connections array
    const userConnections = [];

    // Add parent connections if provided
    if (parentUserIds?.length) {
      userConnections.push(
        ...parentUserIds.map((userId) => ({
          playerId: newPlayer.id,
          userId,
          tenantId: Number(tenantId),
          isParent: true,
          isOwner: false,
        }))
      );
    }

    // Add owner connection if provided
    if (ownerUserId) {
      userConnections.push({
        playerId: newPlayer.id,
        userId: ownerUserId,
        tenantId: Number(tenantId),
        isParent: false,
        isOwner: true,
      });
    }

    // Insert user connections if any
    if (userConnections.length > 0) {
      const { error: userError } = await client
        .from("playerUserConnections")
        .insert(userConnections);

      if (userError) throw userError;
    }

    return getPlayerWithRelations(client, newPlayer.id);
  } catch (error) {
    console.error("Error in addPlayerToTenant:", error);
    throw error;
  }
};

export const updatePlayer = async (
  client: TypedClient,
  data: PlayerForm,
  playerId: number,
  tenantId: string
) => {
  try {
    const { teamIds, parentUserIds, ownerUserId, ...playerData } = data;

    // Update player base data
    const { error: updateError } = await client
      .from("players")
      .update(playerData)
      .eq("id", playerId)
      .eq("tenantId", tenantId);

    if (updateError) throw updateError;

    // Update team connections if provided
    if (teamIds !== undefined) {
      // Delete existing team connections
      const { error: deleteTeamError } = await client
        .from("playerTeamConnections")
        .delete()
        .eq("playerId", playerId);

      if (deleteTeamError) throw deleteTeamError;

      // Add new team connections
      if (teamIds.length > 0) {
        const teamConnections = teamIds.map((teamId) => ({
          playerId,
          teamId,
          tenantId: Number(tenantId),
        }));

        const { error: teamError } = await client
          .from("playerTeamConnections")
          .insert(teamConnections);

        if (teamError) throw teamError;
      }
    }

    // Delete all existing user connections
    const { error: deleteUserError } = await client
      .from("playerUserConnections")
      .delete()
      .eq("playerId", playerId);

    if (deleteUserError) throw deleteUserError;

    // Create new user connections array
    const userConnections = [];

    // Add parent connections if provided
    if (parentUserIds?.length) {
      userConnections.push(
        ...parentUserIds.map((userId) => ({
          playerId,
          userId,
          tenantId: Number(tenantId),
          isParent: true,
          isOwner: false,
        }))
      );
    }

    // Add owner connection if provided
    if (ownerUserId) {
      userConnections.push({
        playerId,
        userId: ownerUserId,
        tenantId: Number(tenantId),
        isParent: false,
        isOwner: true,
      });
    }

    // Insert new user connections if any
    if (userConnections.length > 0) {
      const { error: userError } = await client
        .from("playerUserConnections")
        .insert(userConnections);

      if (userError) throw userError;
    }

    return getPlayerWithRelations(client, playerId);
  } catch (error) {
    console.error("Error in updatePlayer:", error);
    throw error;
  }
};

export const deletePlayer = async (
  client: TypedClient,
  playerId: number,
  tenantId: string
) => {
  try {
    // Delete player team connections
    const { error: teamError } = await client
      .from("playerTeamConnections")
      .delete()
      .eq("playerId", playerId);

    if (teamError) throw teamError;

    // Delete player user connections
    const { error: userError } = await client
      .from("playerUserConnections")
      .delete()
      .eq("playerId", playerId);

    if (userError) throw userError;

    // Delete player
    const { error: playerError } = await client
      .from("players")
      .delete()
      .eq("id", playerId)
      .eq("tenantId", tenantId);

    if (playerError) throw playerError;
  } catch (error) {
    console.error("Error in deletePlayer:", error);
    throw error;
  }
};

export const updatePlayerPin = async (
  client: TypedClient,
  playerId: number,
  pin: string,
  tenantId: string
) => {
  const { data, error } = await client
    .from("players")
    .update({ pin })
    .eq("id", playerId)
    .eq("tenantId", tenantId)
    .select(
      `
      id,
      firstName,
      lastName,
      pin
    `
    )
    .single();

  if (error) throw error;

  // Use a simpler schema for pin update response
  const PinUpdateResponseSchema = z.object({
    id: z.number(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    pin: z.union([
      z.string().regex(/^\d{4}$/, "If provided, PIN must be a 4-digit number"),
      z.string().max(0),
      z.null(),
      z.undefined(),
    ]),
  });

  return PinUpdateResponseSchema.parse(data);
};
