import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SeasonForm } from "./Season.schema";
import { updateSeasonById } from "./Season.services";

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
