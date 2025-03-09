import { TypedClient } from "@/libs/supabase/type";
import {
  Training,
  TrainingForm,
  TrainingSchema,
  UpdateTrainingPattern,
  DeleteTrainingPattern,
} from "./Training.schema";
import { TrainingLocation } from "@/entities/tenant/Tenant.schema";

const TRAINING_QUERY_WITH_RELATIONS = `
  *,
  team:teams (
    id,
    age,
    gender,
    skill,
    appearance
  ),
  trainingSeasonConnections:trainingSeasonConnections (
    *,
    season:seasons (
      id,
      startDate,
      endDate,
      breaks
    )
  )
`;

export const getTrainings = async (client: TypedClient, tenantId: string) => {
  try {
    const { data, error } = await client
      .from("trainings")
      .select(TRAINING_QUERY_WITH_RELATIONS)
      .eq("tenantId", tenantId)
      .order("date", { ascending: true });

    if (error) throw error;
    return data.map((training) => TrainingSchema.parse(training));
  } catch (error) {
    console.error("Error in getTrainings:", error);
    throw error;
  }
};

export const getTrainingById = async (
  client: TypedClient,
  trainingId: number,
  tenantId: string
) => {
  try {
    const { data, error } = await client
      .from("trainings")
      .select(TRAINING_QUERY_WITH_RELATIONS)
      .eq("id", trainingId)
      .eq("tenantId", tenantId)
      .single();

    if (error) throw error;
    return TrainingSchema.parse(data);
  } catch (error) {
    console.error("Error in getTrainingById:", error);
    throw error;
  }
};

export const getTeamTrainings = async (
  client: TypedClient,
  teamId: number,
  tenantId: string
) => {
  const { data, error } = await client
    .from("trainings")
    .select(TRAINING_QUERY_WITH_RELATIONS)
    .eq("teamId", teamId)
    .eq("tenantId", tenantId)
    .order("date", { ascending: true });

  if (error) throw error;
  return data.map((training) => TrainingSchema.parse(training));
};

export const addTraining = async (
  client: TypedClient,
  data: TrainingForm,
  tenantId: string
) => {
  try {
    let addedTraining: Training;
    const { seasonIds, ...trainingData } = data;

    // Insert training
    const { data: newTraining, error } = await client
      .from("trainings")
      .insert({
        ...trainingData,
        tenantId: Number(tenantId),
      })
      .select(TRAINING_QUERY_WITH_RELATIONS)
      .single();

    if (error) throw error;

    addedTraining = {
      ...newTraining,
      trainingSeasonConnections: [],
    };

    // Add season connections if provided
    if (seasonIds.length > 0) {
      const seasonConnections = seasonIds.map((seasonId) => ({
        trainingId: newTraining.id,
        seasonId,
        tenantId: Number(tenantId),
      }));

      const { data: seasonData, error: seasonError } = await client
        .from("trainingSeasonConnections")
        .insert(seasonConnections).select(`
          *,
          season:seasons (
            id,
            customName,
            startDate,
            endDate,
            breaks
          )
        `);

      if (seasonError) throw seasonError;

      addedTraining = {
        ...newTraining,
        trainingSeasonConnections: seasonData,
      };
    }

    return TrainingSchema.parse(addedTraining);
  } catch (error) {
    console.error("Error in addTraining:", error);
    throw error;
  }
};

export const updateTraining = async (
  client: TypedClient,
  trainingId: number,
  data: TrainingForm,
  tenantId: string
) => {
  try {
    let updatedTrainingData: Training;
    const { seasonIds, ...trainingData } = data;

    // Update training base data
    const { data: updatedTraining, error } = await client
      .from("trainings")
      .update(trainingData)
      .eq("id", trainingId)
      .eq("tenantId", tenantId)
      .select()
      .single();

    if (error) throw error;

    updatedTrainingData = {
      ...updatedTraining,
      trainingSeasonConnections: [],
    };

    // Update season connections if provided
    if (seasonIds !== undefined) {
      // Delete existing season connections
      const { error: deleteSeasonError } = await client
        .from("trainingSeasonConnections")
        .delete()
        .eq("trainingId", trainingId);

      if (deleteSeasonError) throw deleteSeasonError;

      // Add new season connections
      if (seasonIds.length > 0) {
        const seasonConnections = seasonIds.map((seasonId) => ({
          trainingId,
          seasonId,
          tenantId: Number(tenantId),
        }));

        const { data: seasonData, error: seasonError } = await client
          .from("trainingSeasonConnections")
          .insert(seasonConnections)
          .select();

        if (seasonError) throw seasonError;

        updatedTrainingData = {
          ...updatedTraining,
          trainingSeasonConnections: seasonData,
        };
      }
    }

    return TrainingSchema.parse(updatedTrainingData);
  } catch (error) {
    console.error("Error in updateTraining:", error);
    throw error;
  }
};

export const deleteTraining = async (
  client: TypedClient,
  trainingId: number,
  tenantId: string
) => {
  try {
    // Delete season connections
    const { error: seasonError } = await client
      .from("trainingSeasonConnections")
      .delete()
      .eq("trainingId", trainingId);

    if (seasonError) throw seasonError;

    // Delete training
    const { error: trainingError } = await client
      .from("trainings")
      .delete()
      .eq("id", trainingId)
      .eq("tenantId", tenantId);

    if (trainingError) throw trainingError;

    return true;
  } catch (error) {
    console.error("Error in deleteTraining:", error);
    throw error;
  }
};

export const addTrainingBatch = async (
  client: TypedClient,
  data: {
    dates: string[];
    startTime: string;
    endTime: string;
    location: TrainingLocation;
    teamId: number | null;
    seasonId: number;
  },
  tenantId: string
) => {
  try {
    const trainings = data.dates.map((date) => ({
      date,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      teamId: data.teamId,
    }));

    const { data: newTrainings, error } = await client.rpc(
      "batch_create_trainings",
      {
        p_trainings: trainings,
        p_tenant_id: parseInt(tenantId),
        p_season_id: data.seasonId,
      }
    );

    if (error) throw error;

    // Transform the response to match our schema
    const transformedTrainings = newTrainings.map((training) => ({
      ...training,
      team: null, // We'll need to fetch teams separately if needed
      trainingSeasonConnections: [
        {
          id: 0, // This will be replaced with actual ID
          trainingId: training.id,
          seasonId: data.seasonId,
          tenantId: parseInt(tenantId),
          season: null, // We'll need to fetch seasons separately if needed
        },
      ],
    }));

    return transformedTrainings.map((training) =>
      TrainingSchema.parse(training)
    );
  } catch (error) {
    console.error("Error in addTrainingBatch:", error);
    throw error;
  }
};

export const updateTrainingPattern = async (
  client: TypedClient,
  { tenantId, patternId, updates }: UpdateTrainingPattern
) => {
  const { error } = await client.rpc("update_training_pattern", {
    p_tenant_id: tenantId,
    p_pattern_id: patternId,
    p_updates: updates,
  });

  if (error) throw error;
  return true;
};

export const deleteTrainingPattern = async (
  client: TypedClient,
  { tenantId, patternId, params }: DeleteTrainingPattern
) => {
  const { error } = await client.rpc("delete_training_pattern", {
    p_tenant_id: tenantId,
    p_pattern_id: patternId,
    p_params: params,
  });

  if (error) throw error;
  return true;
};

export const getTrainingsByDayRange = async (
  client: TypedClient,
  tenantId: string,
  days: number
) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // Get UTC date
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);
    const endDateStr = endDate.toISOString().split("T")[0];

    const { data, error } = await client
      .from("trainings")
      .select(TRAINING_QUERY_WITH_RELATIONS)
      .eq("tenantId", tenantId)
      .gte("date", todayStr)
      .lte("date", endDateStr)
      .order("date", { ascending: true })
      .order("startTime", { ascending: true });

    if (error) throw error;
    return data.map((training) => TrainingSchema.parse(training));
  } catch (error) {
    console.error("Error in getTrainingsByDayRange:", error);
    throw error;
  }
};

// Get trainings for a specific date range
export const getTrainingsByDateRange = async (
  client: TypedClient,
  tenantId: string,
  startDate: Date,
  endDate: Date,
  seasonId?: number
): Promise<Training[]> => {
  // Format dates to YYYY-MM-DD for database query
  const formattedStartDate = startDate.toISOString().split("T")[0];
  const formattedEndDate = endDate.toISOString().split("T")[0];

  try {
    let query = client
      .from("trainings")
      .select(TRAINING_QUERY_WITH_RELATIONS)
      .eq("tenantId", tenantId)
      .gte("date", formattedStartDate)
      .lte("date", formattedEndDate)
      .order("date", { ascending: true });

    // If seasonId is provided, filter through trainingSeasonConnections
    if (seasonId) {
      // Get IDs of trainings that are connected to the specified season
      const { data: connectedTrainings, error: connectionError } = await client
        .from("trainingSeasonConnections")
        .select("trainingId")
        .eq("tenantId", tenantId)
        .eq("seasonId", seasonId);

      if (connectionError) throw connectionError;

      if (connectedTrainings && connectedTrainings.length > 0) {
        const trainingIds = connectedTrainings.map((conn) => conn.trainingId);
        query = query.in("id", trainingIds);
      } else {
        // If no trainings are connected to this season, return empty array
        return [];
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.map((training) => TrainingSchema.parse(training));
  } catch (error) {
    console.error("Error in getTrainingsByDateRange:", error);
    throw error;
  }
};
