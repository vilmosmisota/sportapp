"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { EventCalendar, CalendarEvent } from "./EventCalendar";
import { useGamesCalendarEvents } from "./hooks/useGamesCalendarEvents";
import { useTrainingsCalendarEvents } from "./hooks/useTrainingsCalendarEvents";
import { Season } from "@/entities/season/Season.schema";
import { CalendarViewType } from "./types";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/cacheKeys/cacheKeys";
import { getGamesWithDetailsByDateRange } from "@/entities/game/Game.services";
import { getTrainingsByDateRange } from "@/entities/training/Training.services";
import { useSupabase } from "@/libs/supabase/useSupabase";

interface CalendarContainerProps {
  tenantId: string;
  selectedSeason: Season | null;
  tenantName: string;
  onEventClick?: (event: CalendarEvent) => void;
  onEventsLoad?: (events: CalendarEvent[]) => void;
  defaultView?: CalendarViewType;
  filteredEvents?: CalendarEvent[];
  currentMonth?: Date;
  onMonthChange?: (newMonth: Date) => void;
}

export function CalendarContainer({
  tenantId,
  selectedSeason,
  tenantName = "Our Team",
  onEventClick,
  onEventsLoad,
  defaultView = "month",
  filteredEvents,
  currentMonth: propCurrentMonth,
  onMonthChange,
}: CalendarContainerProps) {
  // Get Supabase client and React Query client for prefetching
  const supabaseClient = useSupabase();
  const queryClient = useQueryClient();

  // Use refs to track previous values to avoid infinite loops
  const prevMonthRef = useRef<string>("");
  const prevEventsHashRef = useRef<string>("");

  // Track the current month for data fetching
  const [internalCurrentMonth, setInternalCurrentMonth] = useState<Date>(
    propCurrentMonth || startOfMonth(new Date())
  );

  // Use prop currentMonth if provided, otherwise use internal state
  const currentMonth = propCurrentMonth || internalCurrentMonth;

  // Update internal state when prop changes
  useEffect(() => {
    if (propCurrentMonth) {
      setInternalCurrentMonth(propCurrentMonth);
    }
  }, [propCurrentMonth]);

  // Handle setting the month with callback if provided
  const updateCurrentMonth = useCallback(
    (newMonth: Date) => {
      if (onMonthChange) {
        onMonthChange(newMonth);
      } else {
        setInternalCurrentMonth(newMonth);
      }
    },
    [onMonthChange]
  );

  // Fetch game and training events for the current month
  const {
    data: gameEvents = [],
    isLoading: isLoadingGames,
    isSuccess: isGamesSuccess,
  } = useGamesCalendarEvents(
    tenantId,
    startOfMonth(currentMonth),
    endOfMonth(currentMonth),
    selectedSeason?.id || 0,
    !!tenantId && !!selectedSeason,
    tenantName
  );

  const {
    data: trainingEvents = [],
    isLoading: isLoadingTrainings,
    isSuccess: isTrainingsSuccess,
  } = useTrainingsCalendarEvents(
    tenantId,
    startOfMonth(currentMonth),
    endOfMonth(currentMonth),
    selectedSeason?.id || 0,
    !!tenantId && !!selectedSeason
  );

  // Combine the events
  const allEvents = [...gameEvents, ...trainingEvents];

  // Determine which events to show - filtered or all
  const eventsToShow =
    filteredEvents && filteredEvents.length > 0 ? filteredEvents : allEvents;

  // Notify parent when events are loaded
  const isSuccess = isGamesSuccess && isTrainingsSuccess;

  // Call onEventsLoad when events are ready or month changes
  // But ensure we don't cause infinite loops
  useEffect(() => {
    // Only proceed if we have success and events
    if (!isSuccess || allEvents.length === 0 || !onEventsLoad) {
      return;
    }

    // Create a simple "hash" of the current event IDs to detect real changes
    const currentEventsHash = allEvents
      .map((e) => e.id)
      .sort()
      .join(",");
    const currentMonthKey = format(currentMonth, "yyyy-MM");

    // Check if we actually have new events or changed month
    const hasNewEvents = currentEventsHash !== prevEventsHashRef.current;
    const hasNewMonth = currentMonthKey !== prevMonthRef.current;

    // Only call onEventsLoad if we have actual changes to report
    if (hasNewEvents || hasNewMonth) {
      onEventsLoad(allEvents);

      // Update refs with current values
      prevEventsHashRef.current = currentEventsHash;
      prevMonthRef.current = currentMonthKey;
    }
  }, [isSuccess, allEvents, onEventsLoad, currentMonth]);

  // Prefetch next month's data when current month loads successfully
  useEffect(() => {
    if (isSuccess && tenantId && selectedSeason) {
      // Prefetch next month's data
      const nextMonth = addMonths(currentMonth, 1);
      const nextMonthStart = startOfMonth(nextMonth);
      const nextMonthEnd = endOfMonth(nextMonth);
      const monthKey = format(nextMonthStart, "yyyy-MM");

      // Prefetch games
      queryClient.prefetchQuery({
        queryKey: queryKeys.game.calendarEvents(
          tenantId,
          monthKey,
          selectedSeason.id
        ),
        queryFn: async () => {
          return await getGamesWithDetailsByDateRange(
            supabaseClient,
            tenantId,
            nextMonthStart,
            nextMonthEnd,
            selectedSeason.id
          );
        },
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      });

      // Prefetch trainings
      queryClient.prefetchQuery({
        queryKey: queryKeys.training.calendarEvents(
          tenantId,
          monthKey,
          selectedSeason.id
        ),
        queryFn: async () => {
          return await getTrainingsByDateRange(
            supabaseClient,
            tenantId,
            nextMonthStart,
            nextMonthEnd,
            selectedSeason.id
          );
        },
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      });
    }
  }, [
    isSuccess,
    currentMonth,
    tenantId,
    selectedSeason,
    queryClient,
    supabaseClient,
  ]);

  // Handle date range changes (mainly for changing month)
  const handleDateRangeChange = useCallback(
    (start: Date, end: Date) => {
      // We only care about the month, not the exact range
      // Extract the month from the start date (which should be the earlier date)
      const monthOfRange = startOfMonth(start);

      // Only update if the month is different
      if (monthOfRange.getTime() !== startOfMonth(currentMonth).getTime()) {
        updateCurrentMonth(monthOfRange);
      }
    },
    [currentMonth, updateCurrentMonth]
  );

  // Check if data is loading
  const isLoading = isLoadingGames || isLoadingTrainings || !selectedSeason;

  return (
    <EventCalendar
      events={eventsToShow}
      onEventClick={onEventClick}
      onDateRangeChange={handleDateRangeChange}
      defaultView={defaultView}
      isLoading={isLoading}
      seasonBreaks={selectedSeason?.breaks || []}
      seasonDateRange={
        selectedSeason
          ? {
              startDate: selectedSeason.startDate,
              endDate: selectedSeason.endDate,
            }
          : null
      }
    />
  );
}
