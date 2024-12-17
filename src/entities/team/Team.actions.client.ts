import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TeamForm } from "./Team.schema";
import { addTeamToTenant } from "./Team.services";

export const useAddTeamToTenant = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.team.all];

  return useMutation({
    mutationFn: (data: TeamForm) => addTeamToTenant(client, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
