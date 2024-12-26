import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlayerForm } from "./Player.schema";
import {
  addPlayerToTenant,
  deletePlayer,
  updatePlayer,
  getPlayersByTenantId,
} from "./Player.services";

export const usePlayers = (tenantId: string) => {
  const client = useSupabase();

  return useQuery({
    queryKey: [queryKeys.player.all, tenantId],
    queryFn: () => getPlayersByTenantId(client, tenantId),
  });
};

export const useAddPlayerToTenant = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.player.all, tenantId];

  return useMutation({
    mutationFn: (
      data: PlayerForm & {
        parentId?: string;
        teams?: number[];
        membershipCategoryId?: number;
        joinDate?: string;
      }
    ) => addPlayerToTenant(client, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useUpdatePlayer = (playerId: number, tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.player.all];

  return useMutation({
    mutationFn: (data: PlayerForm) =>
      updatePlayer(client, data, playerId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useDeletePlayer = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.player.all];

  return useMutation({
    mutationFn: (playerId: number) => deletePlayer(client, playerId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
