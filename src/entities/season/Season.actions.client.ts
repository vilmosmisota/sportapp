import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SeasonForm } from "./Season.schema";
import {
  updateSeasonById,
  addSeasonById,
  deleteSeasonById,
  getSeasonsByTenantId,
} from "./Season.services";

export const useSeasons = (tenantId?: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.season.all];

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!tenantId) throw new Error("Tenant ID is required");
      return getSeasonsByTenantId(tenantId, client);
    },
    enabled: !!tenantId,
  });
};

export const useUpdateSeason = (seasonId: string, tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.season.all];

  return useMutation({
    mutationFn: (data: SeasonForm) => updateSeasonById(client, data, seasonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useAddSeason = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.season.all];

  return useMutation({
    mutationFn: (data: SeasonForm) => addSeasonById(client, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useDeleteSeason = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.season.all];

  return useMutation({
    mutationFn: (seasonId: string) =>
      deleteSeasonById(client, seasonId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
