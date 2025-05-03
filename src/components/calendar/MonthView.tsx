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
  isWithinInterval,
  isBefore,
  isAfter,
} from "date-fns";
import { cn } from "@/libs/tailwind/utils";
import { CalendarEvent } from "./EventCalendar";
import { EventItem } from "./EventItem";
import { getEventsForDay, sortEvents } from "./utils";
import { DayCell } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/utils/hooks";
import { Pause, Calendar } from "lucide-react";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  isLoading?: boolean;
  seasonBreaks?: { from: Date; to: Date }[];
  seasonDateRange?: { startDate: Date; endDate: Date } | null;
  onDayContextMenu?: (date: Date, event: React.MouseEvent) => void;
}

export function MonthView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  isLoading = false,
  seasonBreaks = [],
  seasonDateRange = null,
  onDayContextMenu,
}: MonthViewProps) {
  const [days, setDays] = useState<DayCell[]>([]);
  const [visibleEventCounts, setVisibleEventCounts] = useState<
    Record<string, number>
  >({});
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");

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

  // Helper function to check if a date is valid for adding events
  const isDateValidForEvents = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to beginning of day for proper comparison

    // Check if date is not in the past (less than today)
    const isNotPast = date >= today;

    return isNotPast && !isDateOutsideSeason(date) && !isDateInBreak(date);
  };

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
        isInBreak: isDateInBreak(day),
        isOutsideSeason: isDateOutsideSeason(day),
      });
      day = addDays(day, 1);
    }

    setDays(daysInMonth);
  }, [currentDate, seasonBreaks, seasonDateRange]);

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

  // Handle right-click on a day cell
  const handleDayContextMenu = (date: Date, event: React.MouseEvent) => {
    if (onDayContextMenu && isDateValidForEvents(date)) {
      event.preventDefault(); // Prevent default browser context menu
      onDayContextMenu(date, event);
    }
  };

  // Rendering calendar grid
  return (
    <div className="h-full flex flex-col overflow-hidden">
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
        <div className="grid grid-cols-7 gap-0 md:gap-1 flex-grow">
          {Array.from({ length: 35 }).map((_, index) => (
            <div key={index} className="min-h-[100px] border rounded-md p-1">
              <Skeleton className="h-6 w-6 mb-1 rounded-full" />
              <Skeleton className="h-5 w-full mb-1" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0 md:gap-1 flex-grow">
          {days.map((day) => {
            const dayKey = format(day.date, "yyyy-MM-dd");
            const dayEvents = sortEvents(getEventsForDay(day.date, events));

            // Calculate visible events count, but cap at maximum 3
            const calculatedCount = visibleEventCounts[dayKey] || 2;
            const maxVisibleEvents = Math.min(3, calculatedCount);

            const hasMoreEvents = dayEvents.length > maxVisibleEvents;
            const visibleEvents = dayEvents.slice(0, maxVisibleEvents);

            // Check if this day is valid for adding events
            const isValidForEvents = isDateValidForEvents(day.date);

            return (
              <div
                key={dayKey}
                ref={(el) => (dayRefs.current[dayKey] = el)}
                className={cn(
                  "min-h-[80px] md:min-h-[100px] border flex flex-col p-0.5 md:p-1 transition-colors relative",
                  "md:rounded-md", // Only rounded on medium screens and up
                  day.isCurrentMonth
                    ? "bg-background/10 hover:bg-background/40"
                    : "bg-muted/10 opacity-60 border-dashed border-muted/40 hover:opacity-80 hover:bg-muted/20 transition-opacity",
                  day.isToday && "ring-2 ring-primary ring-offset-1",
                  day.isInBreak && day.isCurrentMonth && "bg-amber-50/50",
                  day.isOutsideSeason && day.isCurrentMonth && "bg-gray-100",
                  !isValidForEvents && "cursor-not-allowed"
                )}
                onContextMenu={(event) => handleDayContextMenu(day.date, event)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {day.isInBreak && day.isCurrentMonth && (
                      <div
                        className="inline-flex items-center text-amber-500 mr-1"
                        title="Season Break"
                      >
                        <Pause className="h-3 w-3 md:h-4 md:w-4" />
                      </div>
                    )}
                    {day.isOutsideSeason && day.isCurrentMonth && (
                      <div
                        className="inline-flex items-center text-gray-400 mr-1"
                        title="Outside Season"
                      >
                        <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full text-xs md:text-sm",
                      day.isToday &&
                        "bg-primary text-primary-foreground font-medium",
                      !day.isCurrentMonth && "text-muted-foreground/60",
                      onDateClick && "cursor-pointer hover:bg-muted/30"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick && onDateClick(day.date);
                    }}
                    title={format(day.date, "PPP")}
                  >
                    {format(day.date, "d")}
                  </span>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col gap-0.5 md:gap-1 mt-0.5 md:mt-1">
                  {day.isInBreak && day.isCurrentMonth && (
                    <div className="text-xs text-amber-600 bg-amber-100/70 px-0.5 md:px-1 py-0.5 rounded border border-amber-200 text-center mb-0.5 md:mb-1 truncate">
                      <span className="inline md:hidden">Break</span>
                      <span className="hidden md:inline">Season Break</span>
                    </div>
                  )}

                  {day.isOutsideSeason && day.isCurrentMonth && (
                    <div className="text-xs text-gray-500 bg-gray-100 px-0.5 md:px-1 py-0.5 rounded border border-gray-200 text-center mb-0.5 md:mb-1 truncate">
                      <span className="inline md:hidden">Outside</span>
                      <span className="hidden md:inline">Outside Season</span>
                    </div>
                  )}

                  {/* Render dots for mobile/small screens */}
                  {isMobile && (
                    <div className="flex flex-wrap gap-0.5">
                      {dayEvents.map((event) => (
                        <EventItem
                          key={event.id}
                          event={event}
                          onClick={onEventClick}
                          variant="minimal"
                          className={!day.isCurrentMonth ? "opacity-50" : ""}
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
                        className={!day.isCurrentMonth ? "opacity-50" : ""}
                      />
                    ))}

                  {/* More events indicator */}
                  {hasMoreEvents && dayEvents.length > 0 && (
                    <div
                      className={cn(
                        "text-2xs md:text-xs px-1 md:px-2 py-0.5 mt-0.5 md:mt-1 cursor-pointer rounded-sm border border-muted/40 transition-colors text-center",
                        day.isCurrentMonth
                          ? "text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                          : "text-muted-foreground/60 hover:text-muted-foreground/80 hover:bg-muted/10"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDateClick) {
                          onDateClick(day.date);
                        }
                      }}
                      title={`View all ${dayEvents.length} events for ${format(
                        day.date,
                        "PPP"
                      )}`}
                    >
                      +{dayEvents.length - maxVisibleEvents} more
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
