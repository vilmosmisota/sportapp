"use client";

import * as React from "react";
import {
  format,
  isSameDay,
  addDays,
  isToday,
  isAfter,
  isWithinInterval,
  isBefore,
} from "date-fns";
import { cn } from "@/libs/tailwind/utils";
import { CalendarEvent } from "./EventCalendar";
import { EventItem } from "./EventItem";
import { sortEvents } from "./utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Pause, Calendar } from "lucide-react";

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  isLoading?: boolean;
  daysToShow?: number;
  seasonBreaks?: { from: Date; to: Date }[];
  seasonDateRange?: { startDate: Date; endDate: Date } | null;
}

export function AgendaView({
  currentDate,
  events,
  onEventClick,
  isLoading = false,
  daysToShow = 14,
  seasonBreaks = [],
  seasonDateRange = null,
}: AgendaViewProps) {
  // Helper function to check if a date is within a break period
  const isDateInBreak = (date: Date) => {
    return seasonBreaks.some((breakPeriod) =>
      isWithinInterval(date, {
        start: breakPeriod.from,
        end: breakPeriod.to,
      })
    );
  };

  // Helper function to check if a date is outside the season range
  const isDateOutsideSeason = (date: Date) => {
    if (!seasonDateRange) return false;
    return (
      isBefore(date, seasonDateRange.startDate) ||
      isAfter(date, seasonDateRange.endDate)
    );
  };

  // Group events by date
  const groupedEvents = React.useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    const sortedEvents = sortEvents(events);

    // Only consider events from current date onwards
    const relevantEvents = sortedEvents.filter(
      (event) =>
        isAfter(event.start, currentDate) || isSameDay(event.start, currentDate)
    );

    // Group by date
    relevantEvents.forEach((event) => {
      const dateKey = format(event.start, "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [events, currentDate]);

  // Generate date range to display
  const dateRange = React.useMemo(() => {
    const range: Date[] = [];

    for (let i = 0; i < daysToShow; i++) {
      range.push(addDays(currentDate, i));
    }

    return range;
  }, [currentDate, daysToShow]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-[75vh] overflow-auto">
      <div className="space-y-6 px-1">
        {dateRange.map((date) => {
          const dateKey = format(date, "yyyy-MM-dd");
          const dayEvents = groupedEvents[dateKey] || [];
          const isInBreak = isDateInBreak(date);
          const isOutsideSeason = isDateOutsideSeason(date);

          // If there are no events and it's not in a break or outside season, skip the day
          if (dayEvents.length === 0 && !isInBreak && !isOutsideSeason)
            return null;

          return (
            <div key={dateKey} className="space-y-2">
              {/* Date header */}
              <div
                className={cn(
                  "sticky top-0 bg-background py-2 z-10 border-b",
                  isToday(date) && "text-primary font-medium",
                  isInBreak && "bg-amber-50/70",
                  isOutsideSeason && "bg-gray-100"
                )}
              >
                <div className="flex items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mr-2 text-sm",
                      isToday(date) && "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(date, "d")}
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium flex items-center gap-1">
                      {format(date, "EEEE")}
                      {isInBreak && (
                        <span className="inline-flex items-center text-amber-500 text-xs">
                          <Pause className="h-3.5 w-3.5 mr-1" />
                          Season Break
                        </span>
                      )}
                      {isOutsideSeason && (
                        <span className="inline-flex items-center text-gray-400 text-xs">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          Outside Season
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {format(date, "MMMM yyyy")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Events for this day */}
              <div className="space-y-2 pl-12">
                {isInBreak && dayEvents.length === 0 && (
                  <div className="text-sm py-2 px-3 bg-amber-50 border border-amber-200 rounded text-amber-700">
                    No events during this break period
                  </div>
                )}

                {isOutsideSeason && dayEvents.length === 0 && (
                  <div className="text-sm py-2 px-3 bg-gray-100 border border-gray-200 rounded text-gray-500">
                    No events outside season range
                  </div>
                )}

                {dayEvents.map((event) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                    variant="full"
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {Object.keys(groupedEvents).length === 0 &&
          !dateRange.some(isDateInBreak) &&
          !dateRange.some(isDateOutsideSeason) && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-muted-foreground mb-2">
                No upcoming events
              </div>
              <div className="text-sm text-muted-foreground">
                Events will appear here when they are scheduled
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
