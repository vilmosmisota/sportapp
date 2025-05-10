import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlayerForm } from "./Player.schema";
import {
  addPlayerToTenant,
  deletePlayer,
  getPlayersByTenantId,
  updatePlayer,
  updatePlayerPin,
} from "./Player.services";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { queryKeys } from "@/cacheKeys/cacheKeys";

export const usePlayers = (tenantId?: string) => {
  const client = useSupabase();

  return useQuery({
    queryKey: ["players", tenantId],
    queryFn: () => getPlayersByTenantId(client, tenantId!),
    enabled: !!tenantId,
  });
};

export const useAddPlayer = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlayerForm) => addPlayerToTenant(client, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", tenantId] });
    },
  });
};

export const useUpdatePlayer = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, playerId }: { data: PlayerForm; playerId: number }) =>
      updatePlayer(client, data, playerId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", tenantId] });
    },
  });
};

export const useDeletePlayer = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playerId: number) => deletePlayer(client, playerId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", tenantId] });
    },
  });
};

export const useUpdatePlayerPin = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playerId,
      pin,
      teamId,
    }: {
      playerId: number;
      pin: string;
      teamId?: number;
    }) => {
      // Call the actual update service
      const result = await updatePlayerPin(client, playerId, pin, tenantId);
      // Return the result along with the teamId
      return { result, teamId };
    },
    onSuccess: (data) => {
      // Invalidate all player queries
      queryClient.invalidateQueries({ queryKey: queryKeys.player.all });

      // Invalidate the players query for this specific tenant
      queryClient.invalidateQueries({ queryKey: ["players", tenantId] });

      // If teamId is provided, invalidate the specific team players query
      if (data.teamId) {
        const flatKey = ["team", "players", tenantId, data.teamId];
        queryClient.invalidateQueries({
          queryKey: flatKey,
        });
      }
    },
  });
};
