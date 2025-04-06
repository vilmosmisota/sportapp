import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGame, updateGame, deleteGame } from "./Game.services";
import { GameForm } from "./Game.schema";
import { format } from "date-fns";

/**
 * Helper function to invalidate game calendar queries for a specific month
 */
const invalidateGameCalendarQueries = (
  queryClient: any,
  tenantId: string,
  date: Date,
  seasonId?: number
) => {
  // Invalidate all game queries
  queryClient.invalidateQueries({
    queryKey: queryKeys.game.all,
  });

  // Invalidate general calendar events cache
  queryClient.invalidateQueries({
    queryKey: queryKeys.game.allCalendarEvents(tenantId),
  });

  // Get the month key for the specific month of the event
  const monthKey = format(date, "yyyy-MM");

  // Invalidate the specific month's cache
  queryClient.invalidateQueries({
    queryKey: queryKeys.game.calendarEvents(tenantId, monthKey, seasonId),
  });

  // Also invalidate adjacent months in case the event is near month boundaries
  const nextMonth = new Date(date);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const prevMonth = new Date(date);
  prevMonth.setMonth(prevMonth.getMonth() - 1);

  queryClient.invalidateQueries({
    queryKey: queryKeys.game.calendarEvents(
      tenantId,
      format(nextMonth, "yyyy-MM"),
      seasonId
    ),
  });

  queryClient.invalidateQueries({
    queryKey: queryKeys.game.calendarEvents(
      tenantId,
      format(prevMonth, "yyyy-MM"),
      seasonId
    ),
  });
};

/**
 * Hook for creating a new game
 */
export const useCreateGame = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GameForm) => createGame(client, data, tenantId),
    onSuccess: (_, data) => {
      // Use the helper function to invalidate all relevant caches
      invalidateGameCalendarQueries(
        queryClient,
        tenantId,
        data.date,
        data.seasonId
      );
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
      // Invalidate the specific game detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.game.detail(tenantId, variables.gameId),
      });

      // Use the helper function to invalidate calendar views
      // If date is included in the update, use it, otherwise use current date
      const dateToInvalidate = variables.data.date || new Date();
      const seasonId = variables.data.seasonId;

      invalidateGameCalendarQueries(
        queryClient,
        tenantId,
        dateToInvalidate,
        seasonId
      );
    },
  });
};

/**
 * Hook for deleting a game
 */
export const useDeleteGame = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  interface GameData {
    date: string;
    seasonId: number;
  }

  return useMutation({
    mutationFn: async (gameId: number) => {
      try {
        // First fetch the game to get its date before deleting it
        const { data, error } = await client
          .from("games")
          .select("date, seasonId")
          .eq("id", gameId)
          .eq("tenantId", tenantId)
          .single();

        if (error) {
          console.error("Error fetching game before deletion:", error);
        }

        // Then delete the game
        const result = await deleteGame(client, gameId, tenantId);

        // Return both the deletion result and the game data for cache invalidation
        return {
          result,
          gameData: data as GameData | null,
        };
      } catch (error) {
        console.error("Error in delete game mutation:", error);
        // Re-throw the error to be handled by the mutation
        throw error;
      }
    },
    onSuccess: (data) => {
      // Use the helper function to invalidate all relevant caches
      if (data?.gameData?.date) {
        const gameDate = new Date(data.gameData.date);
        invalidateGameCalendarQueries(
          queryClient,
          tenantId,
          gameDate,
          data.gameData.seasonId
        );
      } else {
        // Fallback: If we couldn't get the game data, invalidate broader caches
        queryClient.invalidateQueries({
          queryKey: queryKeys.game.all,
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.game.allCalendarEvents(tenantId),
        });
      }
    },
  });
};
