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
  season:seasons (
    id,
    startDate,
    endDate,
    breaks,
    customName
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
    // Insert training with seasonId directly
    const { data: newTraining, error } = await client
      .from("trainings")
      .insert({
        ...data,
        tenantId: Number(tenantId),
      })
      .select(TRAINING_QUERY_WITH_RELATIONS)
      .single();

    if (error) throw error;
    return TrainingSchema.parse(newTraining);
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
    // Update training base data, including seasonId
    const { data: updatedTraining, error } = await client
      .from("trainings")
      .update(data)
      .eq("id", trainingId)
      .eq("tenantId", tenantId)
      .select(TRAINING_QUERY_WITH_RELATIONS)
      .single();

    if (error) throw error;
    return TrainingSchema.parse(updatedTraining);
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
    // Delete training directly
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
    meta?: { note?: string | null } | null;
  },
  tenantId: string
) => {
  try {
    // Create array of training objects
    const trainings = data.dates.map((date) => ({
      date,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      teamId: data.teamId,
      seasonId: data.seasonId,
      tenantId: parseInt(tenantId),
      meta: data.meta || null,
    }));

    // Insert trainings directly
    const { data: newTrainings, error } = await client
      .from("trainings")
      .insert(trainings)
      .select(TRAINING_QUERY_WITH_RELATIONS);

    if (error) throw error;
    return newTrainings.map((training) => TrainingSchema.parse(training));
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
      .lte("date", formattedEndDate);

    // If seasonId is provided, filter directly by seasonId
    if (seasonId) {
      query = query.eq("seasonId", seasonId);
    }

    const { data, error } = await query.order("date", { ascending: true });

    if (error) throw error;
    return data.map((training) => TrainingSchema.parse(training));
  } catch (error) {
    console.error("Error in getTrainingsByDateRange:", error);
    throw error;
  }
};

export const getTrainingsByPattern = async (
  client: TypedClient,
  tenantId: string,
  pattern: {
    startTime: string;
    endTime: string;
    teamId: number | null;
    firstDate: string;
    lastDate: string;
  }
): Promise<Training[]> => {
  try {
    let query = client
      .from("trainings")
      .select(TRAINING_QUERY_WITH_RELATIONS)
      .eq("tenantId", tenantId)
      .eq("startTime", pattern.startTime)
      .eq("endTime", pattern.endTime)
      .gte("date", pattern.firstDate)
      .lte("date", pattern.lastDate)
      .order("date", { ascending: true });

    // Add teamId filter only if it exists
    if (pattern.teamId !== null) {
      query = query.eq("teamId", pattern.teamId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.map((training) => TrainingSchema.parse(training));
  } catch (error) {
    console.error("Error in getTrainingsByPattern:", error);
    throw error;
  }
};
