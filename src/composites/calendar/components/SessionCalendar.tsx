"use client";

import { Tenant } from "@/entities/tenant/Tenant.schema";
import { cn } from "@/libs/tailwind/utils";
import { useCalendarNavigation } from "../hooks/useCalendarNavigation";
import { useSessionCalendarData } from "../providers/SessionDataProvider";
import { CalendarConfig, CalendarSeason } from "../types/calendar.types";
import { CalendarEventHandlers, SessionEvent } from "../types/event.types";
import { Calendar } from "./Calendar";

interface SessionCalendarProps extends CalendarEventHandlers<SessionEvent> {
  tenant: Tenant;
  groupId: number;
  seasonId: number;
  season?: CalendarSeason;
  config: CalendarConfig<SessionEvent>;
  className?: string;
  enabled?: boolean;
}

export function SessionCalendar({
  tenant,
  groupId,
  seasonId,
  season,
  config,
  className,
  enabled = true,
  onEventClick,
  onEventDoubleClick,
  onDateClick,
  onDateRangeChange,
  onViewChange,
}: SessionCalendarProps) {
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

  const { events, isLoading, isError, error, refetch } = useSessionCalendarData(
    tenant,
    groupId,
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
              Failed to load sessions
            </div>
            <div className="text-muted-foreground text-sm mb-4">
              {error.message || "An error occurred while loading sessions"}
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
      events={events}
      config={config}
      season={season}
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
