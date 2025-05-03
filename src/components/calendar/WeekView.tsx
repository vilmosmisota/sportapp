"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  isToday,
  isSameDay,
  isWithinInterval,
  getHours,
  getMinutes,
  addMinutes,
  isBefore,
  isAfter,
} from "date-fns";
import { cn } from "@/libs/tailwind/utils";
import { CalendarEvent } from "./EventCalendar";
import { getEventsForTimeRange, generateTimeSlots } from "./utils";
import { EventItem } from "./EventItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Pause, Calendar } from "lucide-react";

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  isLoading?: boolean;
  seasonBreaks?: { from: Date; to: Date }[];
  seasonDateRange?: { startDate: Date; endDate: Date } | null;
}

export function WeekView({
  currentDate,
  events,
  onEventClick,
  isLoading = false,
  seasonBreaks = [],
  seasonDateRange = null,
}: WeekViewProps) {
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<
    { time: string; hour: number; minute: number }[]
  >([]);
  const [nowIndicatorPosition, setNowIndicatorPosition] = useState<number>(0);

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

  // Generate week days
  useEffect(() => {
    const days: Date[] = [];
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday

    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }

    setWeekDays(days);
  }, [currentDate]);

  // Generate time slots
  useEffect(() => {
    const slots = generateTimeSlots(6, 23, 60); // 6am to 11pm, hourly
    setTimeSlots(slots);
  }, []);

  // Update now indicator position
  useEffect(() => {
    const updateNowIndicator = () => {
      const now = new Date();
      const hours = getHours(now);
      const minutes = getMinutes(now);

      // Calculate position as percentage of the day
      const totalMinutesInDay = 24 * 60;
      const minutesSinceMidnight = hours * 60 + minutes;
      const percentageOfDay = (minutesSinceMidnight / totalMinutesInDay) * 100;

      setNowIndicatorPosition(percentageOfDay);
    };

    updateNowIndicator();
    const interval = setInterval(updateNowIndicator, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate the position and size of an event in the week grid
  const getEventPosition = (event: CalendarEvent, day: Date) => {
    // Find which day of the week this event is on
    const eventDay = event.start;
    if (!isSameDay(eventDay, day)) return null;

    const startHour = getHours(event.start);
    const startMinute = getMinutes(event.start);
    const endHour = getHours(event.end);
    const endMinute = getMinutes(event.end);

    // Calculate top position (percentage of the day)
    const startPercentage = ((startHour * 60 + startMinute) / (24 * 60)) * 100;

    // Calculate height (percentage of the day)
    const durationMinutes =
      endHour * 60 + endMinute - (startHour * 60 + startMinute);
    const heightPercentage = (durationMinutes / (24 * 60)) * 100;

    return {
      top: `${startPercentage}%`,
      height: `${heightPercentage}%`,
    };
  };

  // Get events for this week
  const weekEvents = getEventsForTimeRange(
    weekDays[0] || currentDate,
    weekDays[6] || currentDate,
    events
  );

  // Filter events for a specific day
  const getEventsForDay = (day: Date) => {
    return weekEvents.filter((event) => isSameDay(event.start, day));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Week day headers */}
      <div className="grid grid-cols-8 border-b">
        {/* Time column header (empty) */}
        <div className="sticky left-0 bg-background z-10 border-r p-2"></div>

        {/* Day column headers */}
        {weekDays.map((day) => {
          const isInBreak = isDateInBreak(day);
          const isOutsideSeason = isDateOutsideSeason(day);

          return (
            <div
              key={format(day, "yyyy-MM-dd")}
              className={cn(
                "p-2 text-center relative",
                isToday(day) && "bg-primary/10",
                isInBreak && "bg-amber-50",
                isOutsideSeason && "bg-gray-100"
              )}
            >
              <div className="text-sm font-medium">
                {format(day, "EEE")}
                {isInBreak && (
                  <Pause className="h-3 w-3 inline-block ml-1 text-amber-500" />
                )}
                {isOutsideSeason && (
                  <Calendar className="h-3 w-3 inline-block ml-1 text-gray-400" />
                )}
              </div>
              <div
                className={cn(
                  "w-8 h-8 rounded-full mx-auto flex items-center justify-center text-sm",
                  isToday(day) && "bg-primary text-primary-foreground"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      {isLoading ? (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-8 h-[1200px] relative">
            {Array.from({ length: 17 }).map((_, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <div className="border-r p-2 sticky left-0 bg-background z-10">
                  <Skeleton className="h-4 w-10" />
                </div>
                {Array.from({ length: 7 }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className="border-b relative min-h-[60px]"
                  >
                    {Math.random() > 0.8 && (
                      <Skeleton className="absolute top-1 left-1 right-1 h-12 rounded-md" />
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto relative">
          <div className="grid grid-cols-[auto_repeat(7,_1fr)] grid-rows-[auto_repeat(24,_minmax(60px,_1fr))]">
            {/* Current time indicator */}
            {weekDays.some((day) => isToday(day)) && (
              <div
                className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
                style={{ top: `${nowIndicatorPosition}%` }}
              >
                <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
              </div>
            )}

            {/* Time slots */}
            {timeSlots.map((slot) => (
              <React.Fragment key={slot.time}>
                {/* Time label */}
                <div
                  className="border-r p-2 sticky left-0 bg-background z-10 text-muted-foreground text-sm"
                  style={{
                    top: `${
                      ((slot.hour * 60 + slot.minute) / (24 * 60)) * 100
                    }%`,
                    height: `${(60 / (24 * 60)) * 100}%`,
                  }}
                >
                  {slot.time}
                </div>

                {/* Day columns */}
                {weekDays.map((day) => {
                  const isInBreak = isDateInBreak(day);
                  const isOutsideSeason = isDateOutsideSeason(day);

                  return (
                    <div
                      key={`${format(day, "yyyy-MM-dd")}-${slot.time}`}
                      className={cn(
                        "border-b border-r relative min-h-[60px]",
                        isToday(day) && "bg-primary/5",
                        isInBreak && "bg-amber-50/30",
                        isOutsideSeason && "bg-gray-100/40"
                      )}
                    >
                      {isInBreak && slot.hour === 12 && (
                        <div className="absolute inset-x-0 text-center z-10 pointer-events-none">
                          <div className="text-xs py-0.5 md:py-1 px-1 md:px-2 bg-amber-100/70 border border-amber-200 rounded text-amber-600 inline-block truncate">
                            <span className="inline md:hidden">Break</span>
                            <span className="hidden md:inline">
                              Season Break
                            </span>
                          </div>
                        </div>
                      )}
                      {isOutsideSeason && slot.hour === 12 && (
                        <div className="absolute inset-x-0 text-center z-10 pointer-events-none">
                          <div className="text-xs py-0.5 md:py-1 px-1 md:px-2 bg-gray-100 border border-gray-200 rounded text-gray-500 inline-block truncate">
                            <span className="inline md:hidden">Outside</span>
                            <span className="hidden md:inline">
                              Outside Season
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}

            {/* Render events */}
            {weekDays.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day);

              return dayEvents.map((event) => {
                const position = getEventPosition(event, day);
                if (!position) return null;

                return (
                  <div
                    key={`${event.id}-${dayIndex}`}
                    className="absolute z-10 left-1 right-1"
                    style={{
                      top: position.top,
                      height: position.height,
                      gridColumn: `${dayIndex + 2}`,
                    }}
                  >
                    <EventItem
                      event={event}
                      onClick={onEventClick}
                      variant="compact"
                      className="h-full flex items-center overflow-hidden"
                    />
                  </div>
                );
              });
            })}
          </div>
        </div>
      )}
    </div>
  );
}
