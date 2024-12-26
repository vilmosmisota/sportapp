import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlayerTeamConnectionForm } from "./PlayerTeam.schema";
import {
  addPlayerToTeam,
  getPlayerTeamConnections,
  removePlayerFromTeam,
} from "./PlayerTeam.services";

export const usePlayerTeamConnections = (
  tenantId: string,
  filters?: { playerId?: number; teamId?: number }
) => {
  const client = useSupabase();

  return useQuery({
    queryKey: [queryKeys.playerTeam.all, tenantId, filters],
    queryFn: () => getPlayerTeamConnections(client, tenantId, filters),
  });
};

export const useAddPlayerToTeam = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlayerTeamConnectionForm) =>
      addPlayerToTeam(client, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.playerTeam.all],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.team.all],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.player.all],
      });
    },
  });
};

export const useRemovePlayerFromTeam = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playerId, teamId }: { playerId: number; teamId: number }) =>
      removePlayerFromTeam(client, playerId, teamId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.playerTeam.all],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.team.all],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.player.all],
      });
    },
  });
};
