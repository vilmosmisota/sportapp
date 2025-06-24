"use client";

import { cn } from "@/libs/tailwind/utils";
import { useState } from "react";
import { Tenant } from "../../../entities/tenant/Tenant.schema";
import { useCalendarNavigation } from "../hooks/useCalendarNavigation";
import { useAllGroupsEventCalendarData } from "../providers/EventDataProvider";
import { EventDialogProvider } from "../providers/EventDialogProvider";
import {
  CalendarConfig,
  CalendarEvent,
  CalendarSeason,
  DateRange,
} from "../types/calendar.types";
import { CalendarEventHandlers } from "../types/event.types";
import { getMonthDateRange } from "../utils/date.utils";
import { Calendar } from "./Calendar";

interface AllGroupsEventCalendarProps<
  TEvent extends CalendarEvent = CalendarEvent
> extends CalendarEventHandlers<TEvent> {
  tenant: Tenant;
  seasonId: number;
  config: CalendarConfig<TEvent>;
  season?: CalendarSeason;
  className?: string;
  enabled?: boolean;
  onEditEvent?: (event: TEvent) => void;
  onDeleteEvent?: (event: TEvent) => void;
}

export function AllGroupsEventCalendar<
  TEvent extends CalendarEvent = CalendarEvent
>({
  tenant,
  seasonId,
  config,
  season,
  className,
  enabled = true,
  onEventClick,
  onEventDoubleClick,
  onDateClick,
  onDateRangeChange,
  onViewChange,
  onAddSession,
  onEditEvent,
  onDeleteEvent,
}: AllGroupsEventCalendarProps<TEvent>) {
  const tenantId = tenant.id;

  const [currentDateRange, setCurrentDateRange] = useState<DateRange>(
    getMonthDateRange(new Date())
  );

  const {
    navigation,
    goToDate,
    goToToday,
    changeView,
    goToPrevious,
    goToNext,
  } = useCalendarNavigation({
    defaultView: config.defaultView,
    onDateRangeChange: (dateRange) => {
      setCurrentDateRange(dateRange);
      onDateRangeChange?.(dateRange);
    },
    onViewChange,
  });

  // Fetch events for all groups in the current date range
  const { events, isLoading, isError, error, refetch } =
    useAllGroupsEventCalendarData(
      tenantId,
      seasonId,
      currentDateRange,
      enabled,
      tenant.tenantConfigs?.groups || undefined
    );

  const handleEditEvent = (event: CalendarEvent) => {
    if (onEditEvent) {
      onEditEvent(event as TEvent);
    }
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    if (onDeleteEvent) {
      onDeleteEvent(event as TEvent);
    }
  };

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
    <EventDialogProvider
      onEditEvent={handleEditEvent}
      onDeleteEvent={handleDeleteEvent}
    >
      <Calendar
        events={events as TEvent[]}
        config={config}
        season={season}
        isLoading={isLoading}
        className={className}
        onEventClick={onEventClick}
        onEventDoubleClick={onEventDoubleClick}
        onDateClick={onDateClick}
        onDateRangeChange={(dateRange) => {
          setCurrentDateRange(dateRange);
          onDateRangeChange?.(dateRange);
        }}
        onViewChange={onViewChange}
        onAddSession={onAddSession}
      />
    </EventDialogProvider>
  );
}
