"use client";

import { cn } from "@/libs/tailwind/utils";
import { useCalendarNavigation } from "../hooks/useCalendarNavigation";
import { useAllGroupsEventCalendarData } from "../providers/EventDataProvider";
import { CalendarConfig, CalendarEvent } from "../types/calendar.types";
import { CalendarEventHandlers } from "../types/event.types";
import { Calendar } from "./Calendar";

interface AllGroupsEventCalendarProps<
  TEvent extends CalendarEvent = CalendarEvent
> extends CalendarEventHandlers<TEvent> {
  tenantId: number;
  seasonId: number;
  config: CalendarConfig<TEvent>;
  className?: string;
  enabled?: boolean;
}

export function AllGroupsEventCalendar<
  TEvent extends CalendarEvent = CalendarEvent
>({
  tenantId,
  seasonId,
  config,
  className,
  enabled = true,
  onEventClick,
  onEventDoubleClick,
  onDateClick,
  onDateRangeChange,
  onViewChange,
}: AllGroupsEventCalendarProps<TEvent>) {
  const {
    navigation,
    goToDate,
    goToToday,
    changeView,
    goToPrevious,
    goToNext,
  } = useCalendarNavigation({
    defaultView: config.defaultView,
    onDateRangeChange,
    onViewChange,
  });

  // Fetch events for all groups in the current date range
  const { events, isLoading, isError, error, refetch } =
    useAllGroupsEventCalendarData(
      tenantId,
      seasonId,
      navigation.dateRange,
      enabled
    );

  // Handle errors
  if (isError && error) {
    return (
      <div
        className={cn(
          "flex flex-col h-full bg-card border border-border rounded-lg shadow-sm",
          className
        )}
      >
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-destructive font-medium mb-2">
              Failed to load events
            </div>
            <div className="text-muted-foreground text-sm mb-4">
              {(error as Error)?.message ||
                "An error occurred while loading events"}
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Calendar
      events={events as TEvent[]}
      config={config}
      isLoading={isLoading}
      className={className}
      onEventClick={onEventClick}
      onEventDoubleClick={onEventDoubleClick}
      onDateClick={onDateClick}
      onDateRangeChange={onDateRangeChange}
      onViewChange={onViewChange}
    />
  );
}
