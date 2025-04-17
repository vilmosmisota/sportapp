"use client";

import { useCallback, useMemo } from "react";
import { startOfMonth } from "date-fns";
import { EventCalendar, CalendarEvent } from "./EventCalendar";
import { Season } from "@/entities/season/Season.schema";
import { CalendarViewType } from "./types";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/libs/supabase/useSupabase";
import {
  useGamesCalendarEvents,
  useTrainingsCalendarEvents,
  useCurrentMonth,
  useDateRangeAndPrefetch,
  useEventLoadNotification,
} from "./hooks";
import { mergeFilteredWithUpdatedEvents } from "./utils";

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
  const { currentMonth, updateCurrentMonth } = useCurrentMonth(
    propCurrentMonth,
    onMonthChange
  );

  const dateRange = useDateRangeAndPrefetch(
    currentMonth,
    tenantId,
    selectedSeason
  );

  const fetchingEnabled = !!tenantId && !!selectedSeason;
  const seasonId = selectedSeason?.id || 0;

  const {
    data: gameEvents = [],
    isLoading: isLoadingGames,
    isSuccess: isGamesSuccess,
  } = useGamesCalendarEvents(
    tenantId,
    dateRange.start,
    dateRange.end,
    seasonId,
    fetchingEnabled,
    tenantName
  );

  const {
    data: trainingEvents = [],
    isLoading: isLoadingTrainings,
    isSuccess: isTrainingsSuccess,
  } = useTrainingsCalendarEvents(
    tenantId,
    dateRange.start,
    dateRange.end,
    seasonId,
    fetchingEnabled
  );

  const allEvents = useMemo(
    () => [...gameEvents, ...trainingEvents],
    [gameEvents, trainingEvents]
  );

  const eventsToShow = useMemo(
    () => mergeFilteredWithUpdatedEvents(filteredEvents || [], allEvents),
    [filteredEvents, allEvents]
  );

  const isSuccess = isGamesSuccess && isTrainingsSuccess;
  useEventLoadNotification(allEvents, isSuccess, currentMonth, onEventsLoad);

  const handleDateRangeChange = useCallback(
    (start: Date, end: Date) => {
      const monthOfRange = startOfMonth(start);
      const currentMonthStart = startOfMonth(currentMonth);

      if (monthOfRange.getTime() !== currentMonthStart.getTime()) {
        updateCurrentMonth(monthOfRange);
      }
    },
    [currentMonth, updateCurrentMonth]
  );

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
