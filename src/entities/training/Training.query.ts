import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import {
  getTrainings,
  getTrainingById,
  getTrainingsByDayRange,
  getTrainingsByDateRange,
} from "./Training.services";
import { useQuery } from "@tanstack/react-query";
import {
  GroupedTraining,
  GroupedTrainingSchema,
  Training,
} from "./Training.schema";
import { z } from "zod";
import { format } from "date-fns";

export const useTrainings = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.training.all, tenantId];

  return useQuery({
    queryKey,
    queryFn: () => getTrainings(client, tenantId),
    enabled: !!tenantId,
  });
};

export const useGroupedTrainings = (tenantId: string, seasonId?: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.training.grouped, tenantId, seasonId];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await client.rpc("get_grouped_trainings", {
        p_tenant_id: parseInt(tenantId),
        p_season_id: seasonId ? parseInt(seasonId) : null,
      });

      if (error) throw error;

      // Parse and validate the response data
      const parsedData = z.array(GroupedTrainingSchema).parse(data);
      return parsedData;
    },
    enabled: !!tenantId,
  });
};

export const useTraining = (tenantId: string, trainingId: number) => {
  const client = useSupabase();
  const queryKey = [queryKeys.training.detail(tenantId, String(trainingId))];

  return useQuery({
    queryKey,
    queryFn: () => getTrainingById(client, trainingId, tenantId),
    enabled: !!tenantId && !!trainingId,
  });
};

export const useTrainingsByDayRange = (tenantId: string, days: number) => {
  const client = useSupabase();
  const queryKey = [queryKeys.training.byDayRange(days), tenantId];

  return useQuery({
    queryKey,
    queryFn: () => getTrainingsByDayRange(client, tenantId, days),
    enabled: !!tenantId,
  });
};

export const useTrainingsForMonthQuery = (
  tenantId: string,
  startDate: Date,
  endDate: Date,
  seasonId?: number,
  enabled = true
) => {
  const client = useSupabase();

  // Format dates for cache keys
  const formattedStart = format(startDate, "yyyy-MM-dd");
  const formattedEnd = format(endDate, "yyyy-MM-dd");

  // Create query key
  const queryKey = queryKeys.training.byDateRange(
    tenantId,
    formattedStart,
    formattedEnd,
    seasonId
  );

  return useQuery<Training[]>({
    queryKey,
    queryFn: async () =>
      getTrainingsByDateRange(client, tenantId, startDate, endDate, seasonId),
    enabled: enabled && !!tenantId,
  });
};
