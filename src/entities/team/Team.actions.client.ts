import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TeamForm, isOpponentTeam } from "./Team.schema";
import { createTeam, deleteTeam, updateTeam } from "./Team.services";

export const useAddTeamToTenant = (
  tenantId: string,
  opponentId: number | null = null
) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.team.all];

  return useMutation({
    mutationFn: (data: TeamForm) =>
      createTeam(client, data, tenantId, opponentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      // Also invalidate opponents queries if this is an opponent team
      if (opponentId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.opponent.all });
      }
    },
  });
};

export const useUpdateTeam = (teamId: number, tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.team.all];

  return useMutation({
    mutationFn: (data: TeamForm) => updateTeam(client, data, teamId, tenantId),
    onSuccess: (updatedTeam) => {
      queryClient.invalidateQueries({ queryKey });
      // Also invalidate opponents queries if this is an opponent team
      if (isOpponentTeam(updatedTeam)) {
        queryClient.invalidateQueries({ queryKey: queryKeys.opponent.all });
      }
    },
  });
};

export const useDeleteTeam = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.team.all];

  return useMutation({
    mutationFn: (teamId: number) => deleteTeam(client, teamId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      // Also invalidate opponents queries since we might have deleted an opponent team
      queryClient.invalidateQueries({ queryKey: queryKeys.opponent.all });
    },
  });
};
