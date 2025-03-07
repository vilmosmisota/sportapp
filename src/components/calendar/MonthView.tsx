"use client";

import { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "@/libs/tailwind/utils";
import { CalendarEvent } from "./EventCalendar";
import { EventItem } from "./EventItem";
import { getEventsForDay, sortEvents } from "./utils";
import { DayCell } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/utils/hooks";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  isLoading?: boolean;
}

export function MonthView({
  currentDate,
  events,
  onEventClick,
  isLoading = false,
}: MonthViewProps) {
  const [days, setDays] = useState<DayCell[]>([]);
  const [visibleEventCounts, setVisibleEventCounts] = useState<
    Record<string, number>
  >({});
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");

  // Generate calendar days for the current month view
  useEffect(() => {
    const daysInMonth: DayCell[] = [];
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    let day = startDate;

    while (day <= endDate) {
      daysInMonth.push({
        date: new Date(day),
        isCurrentMonth: isSameMonth(day, monthStart),
        isToday: isToday(day),
      });
      day = addDays(day, 1);
    }

    setDays(daysInMonth);
  }, [currentDate]);

  // Calculate how many events can be displayed in each day cell
  useEffect(() => {
    if (days.length === 0) return;

    const calculateVisibleEvents = () => {
      const newVisibleCounts: Record<string, number> = {};

      days.forEach((day) => {
        const dayKey = format(day.date, "yyyy-MM-dd");
        const ref = dayRefs.current[dayKey];

        if (ref) {
          // Calculate available height for events
          const cellHeight = ref.clientHeight;
          const headerHeight = 28; // Approximate height of the day header
          const availableHeight = cellHeight - headerHeight;

          // Each event is approximately 28px in compact mode
          const eventHeight = 28;
          const maxVisibleEvents = Math.max(
            1,
            Math.floor(availableHeight / eventHeight)
          );

          newVisibleCounts[dayKey] = maxVisibleEvents;
        }
      });

      setVisibleEventCounts(newVisibleCounts);
    };

    // Initial calculation and on resize
    calculateVisibleEvents();
    window.addEventListener("resize", calculateVisibleEvents);

    return () => {
      window.removeEventListener("resize", calculateVisibleEvents);
    };
  }, [days]);

  // Rendering calendar grid
  return (
    <div className="h-full flex flex-col">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="text-center py-2 text-sm font-medium text-muted-foreground"
          >
            {isMobile ? day.charAt(0) : day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-1 flex-grow">
          {Array.from({ length: 35 }).map((_, index) => (
            <div key={index} className="min-h-[100px] border rounded-md p-1">
              <Skeleton className="h-6 w-6 mb-1 rounded-full" />
              <Skeleton className="h-5 w-full mb-1" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 flex-grow">
          {days.map((day) => {
            const dayKey = format(day.date, "yyyy-MM-dd");
            const dayEvents = sortEvents(getEventsForDay(day.date, events));
            const maxVisibleEvents = visibleEventCounts[dayKey] || 2; // Default to 2
            const hasMoreEvents = dayEvents.length > maxVisibleEvents;
            const visibleEvents = dayEvents.slice(0, maxVisibleEvents);

            return (
              <div
                key={dayKey}
                ref={(el) => (dayRefs.current[dayKey] = el)}
                className={cn(
                  "min-h-[100px] border rounded-md flex flex-col p-1 transition-colors",
                  day.isCurrentMonth ? "bg-background" : "bg-muted/20",
                  day.isToday && "ring-2 ring-primary ring-offset-1"
                )}
              >
                <div className="text-right">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                      day.isToday &&
                        "bg-primary text-primary-foreground font-medium"
                    )}
                  >
                    {format(day.date, "d")}
                  </span>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col gap-1 mt-1">
                  {/* Render dots for mobile/small screens */}
                  {isMobile && (
                    <div className="flex flex-wrap gap-1">
                      {dayEvents.map((event) => (
                        <EventItem
                          key={event.id}
                          event={event}
                          onClick={onEventClick}
                          variant="minimal"
                        />
                      ))}
                    </div>
                  )}

                  {/* Render compact events for larger screens */}
                  {!isMobile &&
                    visibleEvents.map((event) => (
                      <EventItem
                        key={event.id}
                        event={event}
                        onClick={onEventClick}
                        variant="compact"
                      />
                    ))}

                  {/* More events indicator */}
                  {!isMobile && hasMoreEvents && (
                    <div
                      className="text-xs text-muted-foreground mt-1 cursor-pointer hover:text-foreground"
                      onClick={() => {
                        // Could show modal with all events for this day
                        if (dayEvents.length > 0 && onEventClick) {
                          onEventClick(dayEvents[0]);
                        }
                      }}
                    >
                      + {dayEvents.length - maxVisibleEvents} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
