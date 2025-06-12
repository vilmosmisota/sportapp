"use client";

import { cn } from "@/libs/tailwind/utils";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Calendar as CalendarIcon, Pause } from "lucide-react";
import { useMemo } from "react";
import { CalendarEvent, CalendarSeason } from "../../types/calendar.types";
import {
  getBreakForDate,
  isBreakEnd,
  isBreakStart,
  isDateInBreak,
  isDateOutsideSeason,
} from "../../utils/date.utils";
import { EventRenderer } from "../EventRenderer";

interface MonthViewProps<TEvent extends CalendarEvent> {
  currentDate: Date;
  events: TEvent[];
  season?: CalendarSeason;
  onEventClick?: (event: TEvent) => void;
  onEventDoubleClick?: (event: TEvent) => void;
  onDateClick?: (date: Date) => void;
  className?: string;
}

interface DayCell<TEvent extends CalendarEvent> {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isInBreak: boolean;
  isOutsideSeason: boolean;
  isBreakStart: boolean;
  isBreakEnd: boolean;
  breakPeriod?: { from: Date; to: Date };
  events: TEvent[];
}

export function MonthView<TEvent extends CalendarEvent>({
  currentDate,
  events,
  season,
  onEventClick,
  onEventDoubleClick,
  onDateClick,
  className,
}: MonthViewProps<TEvent>) {
  // Generate calendar grid
  const days = useMemo((): DayCell<TEvent>[] => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const daysArray: DayCell<TEvent>[] = [];
    let day = startDate;

    while (day <= endDate) {
      const dayEvents = events.filter((event) =>
        isSameDay(event.startDate, day)
      );

      // Check season and break status
      const isInBreak = season ? isDateInBreak(day, season.breaks) : false;
      const isOutsideSeason = season ? isDateOutsideSeason(day, season) : false;
      const breakPeriod = season
        ? getBreakForDate(day, season.breaks) || undefined
        : undefined;
      const isBreakStartDay = season ? isBreakStart(day, season.breaks) : false;
      const isBreakEndDay = season ? isBreakEnd(day, season.breaks) : false;

      daysArray.push({
        date: new Date(day),
        isCurrentMonth: isSameMonth(day, monthStart),
        isToday: isToday(day),
        isInBreak,
        isOutsideSeason,
        isBreakStart: isBreakStartDay,
        isBreakEnd: isBreakEndDay,
        breakPeriod,
        events: dayEvents,
      });

      day = addDays(day, 1);
    }

    return daysArray;
  }, [currentDate, events, season]);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className={cn("flex flex-col h-full bg-card", className)}>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {weekdays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 bg-card">
        {days.map((day, index) => (
          <div
            key={day.date.toISOString()}
            className={cn(
              "border-r border-b border-border p-2 min-h-[120px] cursor-pointer bg-card relative",
              "hover:bg-accent/50 transition-colors",
              !day.isCurrentMonth && "text-muted-foreground",
              day.isToday && "bg-primary/10 border-primary/30",
              day.isInBreak && "bg-amber-50/70",
              day.isOutsideSeason && "bg-muted/30",
              index % 7 === 6 && "border-r-0" // Remove right border on last column
            )}
            onClick={() => onDateClick?.(day.date)}
          >
            {/* Break indicators */}
            {day.isInBreak && (
              <div className="absolute top-1 right-1" title="Season Break">
                <Pause className="h-3 w-3 text-amber-600" />
              </div>
            )}

            {/* Outside season indicator */}
            {day.isOutsideSeason && (
              <div className="absolute top-1 right-1" title="Outside Season">
                <CalendarIcon className="h-3 w-3 text-muted-foreground" />
              </div>
            )}

            {/* Day number */}
            <div className="flex items-center justify-between mb-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  day.isToday &&
                    "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs",
                  day.isInBreak && "text-amber-700",
                  day.isOutsideSeason && "text-muted-foreground"
                )}
              >
                {format(day.date, "d")}
              </span>
              {day.events.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{day.events.length - 3}
                </span>
              )}
            </div>

            {/* Break period label */}
            {day.isBreakStart && day.breakPeriod && (
              <div className="absolute bottom-1 left-1 right-1">
                <div className="text-xs bg-amber-100 text-amber-700 px-1 py-0.5 rounded text-center truncate">
                  Break: {format(day.breakPeriod.from, "MMM d")} -{" "}
                  {format(day.breakPeriod.to, "MMM d")}
                </div>
              </div>
            )}

            {/* Events */}
            <div className="space-y-1">
              {day.events.slice(0, 3).map((event) => (
                <EventRenderer
                  key={`${event.id}-${day.date.toISOString()}`}
                  event={event}
                  variant="minimal"
                  onClick={onEventClick}
                  onDoubleClick={onEventDoubleClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
