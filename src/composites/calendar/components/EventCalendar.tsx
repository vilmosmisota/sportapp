"use client";

import { Tenant } from "@/entities/tenant/Tenant.schema";
import { cn } from "@/libs/tailwind/utils";
import { useState } from "react";
import { toast } from "sonner";

import { useEventCalendarData } from "../providers/EventDataProvider";
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

interface EventCalendarProps<TEvent extends CalendarEvent = CalendarEvent>
  extends CalendarEventHandlers<TEvent> {
  tenant: Tenant;
  groupId: number;
  seasonId: number;
  season?: CalendarSeason;
  config: CalendarConfig<TEvent>;
  className?: string;
  enabled?: boolean;
  onEditEvent?: (event: TEvent) => void;
  onDeleteEvent?: (event: TEvent) => void;
}

export function EventCalendar<TEvent extends CalendarEvent = CalendarEvent>({
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
  onAddSession,
  onEditEvent,
  onDeleteEvent,
}: EventCalendarProps<TEvent>) {
  const [currentDateRange, setCurrentDateRange] = useState<DateRange>(
    getMonthDateRange(new Date())
  );

  const { events, isLoading, isError, error, refetch } = useEventCalendarData(
    tenant,
    groupId,
    seasonId,
    currentDateRange
  );

  const handleEditEvent = (event: CalendarEvent) => {
    if (onEditEvent) {
      onEditEvent(event as TEvent);
    } else {
      toast.info("Edit event functionality not implemented");
    }
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    if (onDeleteEvent) {
      onDeleteEvent(event as TEvent);
    } else {
      toast.info("Delete event functionality not implemented");
    }
  };

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
              {error.message || "An error occurred while loading events"}
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
