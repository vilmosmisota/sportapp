import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { getTrainings, getTrainingById } from "./Training.services";
import { useQuery } from "@tanstack/react-query";
import { GroupedTraining, GroupedTrainingSchema } from "./Training.schema";
import { z } from "zod";

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
