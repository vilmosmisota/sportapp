import { TypedClient } from "@/libs/supabase/type";
import { Game, GameForm, GameSchema } from "./Game.schema";

// Get all games for a tenant
export const getGamesByTenantId = async (
  client: TypedClient,
  tenantId: string
): Promise<Game[]> => {
  const { data, error } = await client
    .from("games")
    .select(
      `
      *,
      homeTeam:homeTeamId(
        id,
        name,
        age,
        gender,
        appearance
      ),
      awayTeam:awayTeamId(
        id,
        name,
        age,
        gender,
        appearance
      ),
      season:seasonId(
        id,
        customName
      )
    `
    )
    .eq("tenantId", tenantId)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching games:", error);
    throw error;
  }

  // Parse each game through the schema
  return data ? data.map((game) => GameSchema.parse(game)) : [];
};

// Get games for a specific season
export const getGamesBySeason = async (
  client: TypedClient,
  tenantId: string,
  seasonId: number
): Promise<Game[]> => {
  const { data, error } = await client
    .from("games")
    .select(
      `
      *,
      homeTeam:homeTeamId(
        id,
        name,
        age,
        gender,
        appearance
      ),
      awayTeam:awayTeamId(
        id,
        name,
        age,
        gender,
        appearance
      ),
      season:seasonId(
        id,
        customName
      )
    `
    )
    .eq("tenantId", tenantId)
    .eq("seasonId", seasonId)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching games by season:", error);
    throw error;
  }

  // Parse each game through the schema
  return data ? data.map((game) => GameSchema.parse(game)) : [];
};

// Get games for a specific team
export const getGamesByTeam = async (
  client: TypedClient,
  tenantId: string,
  teamId: number
): Promise<Game[]> => {
  const { data, error } = await client
    .from("games")
    .select(
      `
      *,
      homeTeam:homeTeamId(
        id,
        name,
        age,
        gender,
        appearance
      ),
      awayTeam:awayTeamId(
        id,
        name,
        age,
        gender,
        appearance
      ),
      season:seasonId(
        id,
        customName
      )
    `
    )
    .eq("tenantId", tenantId)
    .or(`homeTeamId.eq.${teamId},awayTeamId.eq.${teamId}`)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching games by team:", error);
    throw error;
  }

  // Parse each game through the schema
  return data ? data.map((game) => GameSchema.parse(game)) : [];
};

// Get a single game by ID
export const getGameById = async (
  client: TypedClient,
  tenantId: string,
  gameId: number
): Promise<Game | null> => {
  const { data, error } = await client
    .from("games")
    .select(
      `
      *,
      homeTeam:homeTeamId(
        id,
        name,
        age,
        gender,
        appearance
      ),
      awayTeam:awayTeamId(
        id,
        name,
        age,
        gender,
        appearance
      ),
      season:seasonId(
        id,
        customName
      )
    `
    )
    .eq("tenantId", tenantId)
    .eq("id", gameId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Game not found
    }
    console.error("Error fetching game:", error);
    throw error;
  }

  // Parse the game through the schema
  return data ? GameSchema.parse(data) : null;
};

// Create a new game
export const createGame = async (
  client: TypedClient,
  data: GameForm,
  tenantId: string
): Promise<Game> => {
  // Create a new object with database-friendly values
  const formattedData = {
    date: data.date.toISOString().split("T")[0],
    startTime: data.startTime,
    endTime: data.endTime,
    homeTeamId: data.homeTeamId,
    awayTeamId: data.awayTeamId,
    location: data.location,
    competitionType: data.competitionType,
    seasonId: data.seasonId,
    status: data.status,
    homeScore: data.homeScore,
    awayScore: data.awayScore,
    notes: data.notes,
    tenantId,
  };

  const { data: newGame, error } = await client
    .from("games")
    .insert(formattedData)
    .select()
    .single();

  if (error) {
    console.error("Error creating game:", error);
    throw error;
  }

  return GameSchema.parse(newGame);
};

// Update an existing game
export const updateGame = async (
  client: TypedClient,
  data: Partial<GameForm>,
  gameId: number,
  tenantId: string
): Promise<Game> => {
  // Create a new object with database-friendly values
  const formattedData: Record<string, any> = {};

  // Only include properties that are present in the input data
  if (data.date) formattedData.date = data.date.toISOString().split("T")[0];
  if (data.startTime !== undefined) formattedData.startTime = data.startTime;
  if (data.endTime !== undefined) formattedData.endTime = data.endTime;
  if (data.homeTeamId !== undefined) formattedData.homeTeamId = data.homeTeamId;
  if (data.awayTeamId !== undefined) formattedData.awayTeamId = data.awayTeamId;
  if (data.location !== undefined) formattedData.location = data.location;
  if (data.competitionType !== undefined)
    formattedData.competitionType = data.competitionType;
  if (data.seasonId !== undefined) formattedData.seasonId = data.seasonId;
  if (data.status !== undefined) formattedData.status = data.status;
  if (data.homeScore !== undefined) formattedData.homeScore = data.homeScore;
  if (data.awayScore !== undefined) formattedData.awayScore = data.awayScore;
  if (data.notes !== undefined) formattedData.notes = data.notes;

  const { data: updatedGame, error } = await client
    .from("games")
    .update(formattedData)
    .eq("id", gameId)
    .eq("tenantId", tenantId)
    .select()
    .single();

  if (error) {
    console.error("Error updating game:", error);
    throw error;
  }

  return GameSchema.parse(updatedGame);
};

// Delete a game
export const deleteGame = async (
  client: TypedClient,
  gameId: number,
  tenantId: string
): Promise<void> => {
  const { error } = await client
    .from("games")
    .delete()
    .eq("id", gameId)
    .eq("tenantId", tenantId);

  if (error) {
    console.error("Error deleting game:", error);
    throw error;
  }
};
