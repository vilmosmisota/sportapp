import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGame, updateGame, deleteGame } from "./Game.services";
import { GameForm } from "./Game.schema";

/**
 * Hook for creating a new game
 */
export const useCreateGame = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GameForm) => createGame(client, data, tenantId),
    onSuccess: () => {
      // Invalidate all game queries when a new game is created
      queryClient.invalidateQueries({
        queryKey: queryKeys.game.all,
      });
      // Use the central cache key for invalidating all calendar events for this tenant
      queryClient.invalidateQueries({
        queryKey: queryKeys.game.allCalendarEvents(tenantId),
      });
    },
  });
};

/**
 * Hook for updating an existing game
 */
export const useUpdateGame = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameId,
      data,
    }: {
      gameId: number;
      data: Partial<GameForm>;
    }) => updateGame(client, data, gameId, tenantId),
    onSuccess: (_, variables) => {
      // Invalidate all game queries and the specific game query
      queryClient.invalidateQueries({
        queryKey: queryKeys.game.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.game.detail(tenantId, variables.gameId),
      });
      // Use the central cache key for invalidating all calendar events for this tenant
      queryClient.invalidateQueries({
        queryKey: queryKeys.game.allCalendarEvents(tenantId),
      });
    },
  });
};

/**
 * Hook for deleting a game
 */
export const useDeleteGame = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: number) => deleteGame(client, gameId, tenantId),
    onSuccess: () => {
      // Invalidate all game queries when a game is deleted
      queryClient.invalidateQueries({
        queryKey: queryKeys.game.all,
      });
      // Use the central cache key for invalidating all calendar events for this tenant
      queryClient.invalidateQueries({
        queryKey: queryKeys.game.allCalendarEvents(tenantId),
      });
    },
  });
};
