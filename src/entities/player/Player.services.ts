import { TypedClient } from "@/libs/supabase/type";
import { PlayerForm, PlayerSchema } from "./Player.schema";

export const getPlayersByTenantId = async (
  typedClient: TypedClient,
  tenantId: string
) => {
  // Get players with team connections and parent information
  const { data: players, error } = await typedClient
    .from("players")
    .select(
      `
      *,
      playerTeamConnections:playerTeamConnections(
        *,
        team:teams(*)
      ),
      playerMembership:playerMembership(
        *,
        membershipCategory:membershipCategories(*)
      ),
      parentEntity:userEntities!parentEntityId(
        id,
        userId,
        domainRole,
        user:users(
          id,
          firstName,
          lastName,
          email
        )
      )
    `
    )
    .eq("tenantId", tenantId);

  if (error) {
    throw new Error(error.message);
  }

  // Transform the data to match our schema
  const playersWithRelations = players.map((player) => ({
    ...player,
    playerTeamConnections: player.playerTeamConnections || [],
    membership: player.playerMembership?.[0] || null,
    parent:
      player.parentEntity?.domainRole === "parent"
        ? player.parentEntity?.user
        : null,
  }));

  return playersWithRelations.map((player) => PlayerSchema.parse(player));
};

export const addPlayerToTenant = async (
  client: TypedClient,
  data: PlayerForm & {
    parentId?: string;
    teams?: number[];
    membershipCategoryId?: number;
    joinDate?: string;
  },
  tenantId: string
) => {
  try {
    // First get the userEntity for the parent
    let parentEntityId: number | undefined;
    if (data.parentId) {
      const { data: parentEntity } = await client
        .from("userEntities")
        .select("id")
        .eq("userId", data.parentId)
        .eq("tenantId", Number(tenantId))
        .eq("domainRole", "parent")
        .single();

      parentEntityId = parentEntity?.id;
    }

    // Extract data for different tables
    const { teams, membershipCategoryId, joinDate, ...playerData } = data;

    // Insert the player
    const { data: newPlayer, error: insertError } = await client
      .from("players")
      .insert({
        ...playerData,
        tenantId: Number(tenantId),
        parentEntityId,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Add team connections if provided
    if (teams?.length) {
      const teamConnections = teams.map((teamId) => ({
        playerId: newPlayer.id,
        teamId,
        tenantId: Number(tenantId),
      }));

      const { error: teamError } = await client
        .from("playerTeamConnections")
        .insert(teamConnections);

      if (teamError) throw teamError;
    }

    // Add membership if provided
    if (membershipCategoryId && joinDate) {
      const { error: membershipError } = await client
        .from("playerMembership")
        .insert({
          playerId: newPlayer.id,
          memberhsipCategoryId: membershipCategoryId,
          joinDate,
        });

      if (membershipError) {
        console.error("Membership Error:", membershipError);
        throw membershipError;
      }
    }

    // Fetch the complete player data with all relations
    const { data: playerWithRelations, error: fetchError } = await client
      .from("players")
      .select(
        `
        *,
        playerTeamConnections:playerTeamConnections(
          *,
          team:teams(*)
        ),
        playerMembership:playerMembership(
          *,
          membershipCategory:membershipCategories(*)
        ),
        parentEntity:userEntities!parentEntityId(
          id,
          userId,
          domainRole,
          user:users(
            id,
            firstName,
            lastName,
            email
          )
        )
      `
      )
      .eq("id", newPlayer.id)
      .single();

    if (fetchError) throw fetchError;

    // Only use parent data if the entity has the parent role
    const parentEntity =
      playerWithRelations.parentEntity?.domainRole === "parent"
        ? playerWithRelations.parentEntity
        : null;

    return PlayerSchema.parse({
      ...playerWithRelations,
      teams: (playerWithRelations.playerTeamConnections || []).map(
        (c: { teamId: number }) => c.teamId.toString()
      ),
      membership: playerWithRelations.playerMembership?.[0] || null,
      parent: parentEntity?.user || null,
    });
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
  const { data: player, error } = await client
    .from("players")
    .update({ ...data })
    .eq("id", playerId)
    .eq("tenantId", tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return PlayerSchema.parse(player);
};

export const deletePlayer = async (
  client: TypedClient,
  playerId: number,
  tenantId: string
) => {
  const { error } = await client
    .from("players")
    .delete()
    .eq("id", playerId)
    .eq("tenantId", Number(tenantId));

  if (error) {
    throw new Error(error.message);
  }

  return true;
};
