"use client";

import { useState, useCallback, useEffect } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { EventCalendar, CalendarEvent } from "./EventCalendar";
import { useGamesCalendarEvents } from "./hooks/useGamesCalendarEvents";
import { useTrainingsCalendarEvents } from "./hooks/useTrainingsCalendarEvents";
import { Season } from "@/entities/season/Season.schema";
import { CalendarViewType } from "./types";

interface CalendarContainerProps {
  tenantId: string;
  selectedSeason: Season | null;
  tenantName: string;
  onEventClick?: (event: CalendarEvent) => void;
  onEventsLoad?: (events: CalendarEvent[]) => void;
  defaultView?: CalendarViewType;
}

export function CalendarContainer({
  tenantId,
  selectedSeason,
  tenantName = "Our Team",
  onEventClick,
  onEventsLoad,
  defaultView = "month",
}: CalendarContainerProps) {
  // Track the current month for data fetching
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(new Date())
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

  // Notify parent when events are loaded
  const isSuccess = isGamesSuccess && isTrainingsSuccess;
  const eventsReady = allEvents.length > 0 && isSuccess;

  // Call onEventsLoad when events are ready
  useEffect(() => {
    if (eventsReady && onEventsLoad) {
      onEventsLoad(allEvents);
    }
  }, [eventsReady, allEvents, onEventsLoad]);

  // Handle date range changes (mainly for changing month)
  const handleDateRangeChange = useCallback(
    (start: Date, end: Date) => {
      // We only care about the month, not the exact range
      // Extract the month from the start date (which should be the earlier date)
      const monthOfRange = startOfMonth(start);

      // Only update if the month is different
      if (monthOfRange.getTime() !== startOfMonth(currentMonth).getTime()) {
        console.log(
          "Month changed, fetching new data for:",
          format(monthOfRange, "MMMM yyyy")
        );
        setCurrentMonth(monthOfRange);
      }
    },
    [currentMonth]
  );

  // Check if data is loading
  const isLoading = isLoadingGames || isLoadingTrainings || !selectedSeason;

  return (
    <EventCalendar
      events={allEvents}
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
