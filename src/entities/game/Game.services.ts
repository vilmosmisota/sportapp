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
        age,
        gender,
        skill,
        tenantId,
        coachId,
        appearance,
        opponentId,
        opponent:opponentId(
          id,
          name,
          appearance
        )
      ),
      awayTeam:awayTeamId(
        id,
        age,
        gender,
        skill,
        tenantId,
        coachId,
        appearance,
        opponentId,
        opponent:opponentId(
          id,
          name,
          appearance
        )
      ),
      season:seasonId(
        id,
        customName,
        startDate,
        endDate,
        tenantId,
        isActive,
        breaks,
        phases
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
        age,
        gender,
        skill,
        tenantId,
        coachId,
        appearance,
        opponentId,
        opponent:opponentId(
          id,
          name,
          appearance
        )
      ),
      awayTeam:awayTeamId(
        id,
        age,
        gender,
        skill,
        tenantId,
        coachId,
        appearance,
        opponentId,
        opponent:opponentId(
          id,
          name,
          appearance
        )
      ),
      season:seasonId(
        id,
        customName,
        startDate,
        endDate,
        tenantId,
        isActive,
        breaks,
        phases
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
        age,
        gender,
        skill,
        tenantId,
        coachId,
        appearance,
        opponentId,
        opponent:opponentId(
          id,
          name,
          appearance
        )
      ),
      awayTeam:awayTeamId(
        id,
        age,
        gender,
        skill,
        tenantId,
        coachId,
        appearance,
        opponentId,
        opponent:opponentId(
          id,
          name,
          appearance
        )
      ),
      season:seasonId(
        id,
        customName,
        startDate,
        endDate,
        tenantId,
        isActive,
        breaks,
        phases
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
        age,
        gender,
        skill,
        tenantId,
        coachId,
        appearance,
        opponentId,
        opponent:opponentId(
          id,
          name,
          appearance
        )
      ),
      awayTeam:awayTeamId(
        id,
        age,
        gender,
        skill,
        tenantId,
        coachId,
        appearance,
        opponentId,
        opponent:opponentId(
          id,
          name,
          appearance
        )
      ),
      season:seasonId(
        id,
        customName,
        startDate,
        endDate,
        tenantId,
        isActive,
        breaks,
        phases
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
  try {
    // Build the game object
    const gameData = {
      ...data,
      date: data.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
      tenantId: parseInt(tenantId),
    };

    console.log("gameData", gameData);

    // Create the game
    const { data: newGame, error } = await client
      .from("games")
      .insert(gameData)
      .select(
        "*, homeTeam:homeTeamId(*), awayTeam:awayTeamId(*), season:seasonId(*)"
      )
      .single();

    if (error) {
      console.error("Error creating game:", error);
      throw error;
    }

    return GameSchema.parse(newGame);
  } catch (error) {
    console.error("Error in createGame:", error);
    throw error;
  }
};

// Update an existing game
export const updateGame = async (
  client: TypedClient,
  data: Partial<GameForm>,
  gameId: number,
  tenantId: string
): Promise<Game> => {
  try {
    // Prepare data for update
    const updateData: any = { ...data };

    // Format date if present
    if (data.date) {
      updateData.date = data.date.toISOString().split("T")[0];
    }

    // Update the game
    const { data: updatedGame, error } = await client
      .from("games")
      .update(updateData)
      .eq("id", gameId)
      .eq("tenantId", tenantId)
      .select(
        "*, homeTeam:homeTeamId(*), awayTeam:awayTeamId(*), season:seasonId(*)"
      )
      .single();

    if (error) {
      console.error("Error updating game:", error);
      throw error;
    }

    return GameSchema.parse(updatedGame);
  } catch (error) {
    console.error("Error in updateGame:", error);
    throw error;
  }
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

// Get games for a specific date range
export const getGamesByDateRange = async (
  client: TypedClient,
  tenantId: string,
  startDate: Date,
  endDate: Date,
  seasonId: number
): Promise<Game[]> => {
  // Format dates to YYYY-MM-DD for database query
  const formattedStartDate = startDate.toISOString().split("T")[0];
  const formattedEndDate = endDate.toISOString().split("T")[0];

  // Start with basic query
  const query = client
    .from("games")
    .select(
      `
      *,
      homeTeam:homeTeamId(
        id,
        age,
        gender,
        skill,
        tenantId,
        coachId,
        appearance,
        opponentId,
        opponent:opponentId(
          id,
          name,
          appearance
        )
      ),
      awayTeam:awayTeamId(
        id,
        age,
        gender,
        skill,
        tenantId,
        coachId,
        appearance,
        opponentId,
        opponent:opponentId(
          id,
          name,
          appearance
        )
      ),
      season:seasonId(
        id,
        customName,
        startDate,
        endDate,
        tenantId,
        isActive,
        breaks,
        phases
      )
    `
    )
    .eq("tenantId", tenantId)
    .eq("seasonId", seasonId)
    .gte("date", formattedStartDate)
    .lte("date", formattedEndDate)
    .order("date", { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching games by date range:", error);
    throw error;
  }

  // Parse each game through the schema
  return data ? data.map((game) => GameSchema.parse(game)) : [];
};

/**
 * Get games for a specific date range using the vw_games_with_details view
 * This view provides pre-formatted data about teams, including tenant teams and opponent teams
 * which simplifies client-side transformations
 */
export const getGamesWithDetailsByDateRange = async (
  client: TypedClient,
  tenantId: string,
  startDate: Date,
  endDate: Date,
  seasonId: number
): Promise<any[]> => {
  // Format dates to YYYY-MM-DD for database query
  const formattedStartDate = startDate.toISOString().split("T")[0];
  const formattedEndDate = endDate.toISOString().split("T")[0];

  // Use the view directly
  const { data, error } = await client
    .from("vw_games_with_details")
    .select("*")
    .eq("tenantId", tenantId)
    .eq("seasonId", seasonId)
    .gte("date", formattedStartDate)
    .lte("date", formattedEndDate)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching games with details by date range:", error);
    throw error;
  }

  return data || [];
};
