import { useMemo, useEffect } from "react";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { Season } from "@/entities/season/Season.schema";
import { useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/cacheKeys/cacheKeys";
import { getGamesWithDetailsByDateRange } from "@/entities/game/Game.services";
import { getTrainingsByDateRange } from "@/entities/training/Training.services";
import { DateRange } from "../types";
import { useSupabase } from "../../../libs/supabase/useSupabase";

/**
 * Custom hook that manages date range calculations and prefetches data for the next month
 *
 * @param currentMonth - Current month being displayed
 * @param tenantId - The tenant ID for data fetching
 * @param selectedSeason - The currently selected season
 * @param supabaseClient - Supabase client for data fetching
 * @param queryClient - React Query client for prefetching
 * @returns The date range for the current month
 */
export function useDateRangeAndPrefetch(
  currentMonth: Date,
  tenantId: string,
  selectedSeason: Season | null
): DateRange {
  // Calculate current month's date range
  const supabaseClient = useSupabase();
  const queryClient = useQueryClient();

  const dateRange = useMemo<DateRange>(
    () => ({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    }),
    [currentMonth]
  );

  // Prefetch next month's data to improve perceived performance
  useEffect(() => {
    if (!tenantId || !selectedSeason) return;

    const nextMonth = addMonths(currentMonth, 1);
    const nextDateRange = {
      start: startOfMonth(nextMonth),
      end: endOfMonth(nextMonth),
    };
    const monthKey = format(nextDateRange.start, "yyyy-MM");
    const seasonId = selectedSeason.id;
    const STALE_TIME = 5 * 60 * 1000; // 5 minutes

    // Prefetch games for next month
    queryClient.prefetchQuery({
      queryKey: queryKeys.game.calendarEvents(tenantId, monthKey, seasonId),
      queryFn: () =>
        getGamesWithDetailsByDateRange(
          supabaseClient,
          tenantId,
          nextDateRange.start,
          nextDateRange.end,
          seasonId
        ),
      staleTime: STALE_TIME,
    });

    // Prefetch trainings for next month
    queryClient.prefetchQuery({
      queryKey: queryKeys.training.calendarEvents(tenantId, monthKey, seasonId),
      queryFn: () =>
        getTrainingsByDateRange(
          supabaseClient,
          tenantId,
          nextDateRange.start,
          nextDateRange.end,
          seasonId
        ),
      staleTime: STALE_TIME,
    });
  }, [currentMonth, tenantId, selectedSeason, queryClient, supabaseClient]);

  return dateRange;
}
