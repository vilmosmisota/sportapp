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
import React, { useMemo } from "react";
import { DialogEventRenderer } from "../../components/DialogEventRenderer";
import { useCalendarInteraction } from "../../hooks/useCalendarInteraction";
import { CalendarEvent, CalendarSeason } from "../../types/calendar.types";
import {
  getBreakForDate,
  isBreakEnd,
  isBreakStart,
  isDateInBreak,
  isDateOutsideSeason,
} from "../../utils/date.utils";
import { CalendarContextMenu } from "../CalendarContextMenu";
import { EventRenderer } from "../EventRenderer";

interface MonthViewProps<TEvent extends CalendarEvent> {
  currentDate: Date;
  events: TEvent[];
  season?: CalendarSeason;
  onEventClick?: (event: TEvent) => void;
  onEventDoubleClick?: (event: TEvent) => void;
  onDateClick?: (date: Date) => void;
  onAddSession?: (date: Date) => void;
  onDayNumberClick?: (date: Date) => void;
  selectedDate?: Date | null;
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
  onAddSession,
  onDayNumberClick,
  selectedDate,
  className,
}: MonthViewProps<TEvent>) {
  const { handleDoubleClick, handleTouchStart, handleTouchEnd } =
    useCalendarInteraction();

  const openContextMenu = (element: HTMLDivElement) => {
    if (element && (element as any).__openContextMenu) {
      (element as any).__openContextMenu();
    }
  };

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

  const handleDateClick = (date: Date) => {
    onDateClick?.(date);
  };

  const handleDayNumberClick = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    onDayNumberClick?.(date);
  };

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
        {days.map((day, index) => {
          const dayKey = day.date.toISOString();
          const isSelected = selectedDate
            ? isSameDay(day.date, selectedDate)
            : false;

          return (
            <CalendarContextMenu
              key={dayKey}
              date={day.date}
              onAddSession={onAddSession || (() => {})}
            >
              <div
                className={cn(
                  "border-r border-b border-border p-2 min-h-[120px] cursor-pointer bg-card relative",
                  "hover:bg-accent/50 transition-colors",
                  "hover:shadow-sm transition-all duration-200",
                  !day.isCurrentMonth && "text-muted-foreground",
                  day.isToday && "bg-primary/10 border-primary/30",
                  day.isInBreak && "bg-amber-50/70",
                  day.isOutsideSeason && "bg-muted/30",
                  isSelected && "ring-2 ring-primary ring-inset bg-primary/5",
                  index % 7 === 6 && "border-r-0" // Remove right border on last column
                )}
                onClick={() => handleDateClick(day.date)}
                onDoubleClick={handleDoubleClick((e) => {
                  const element = e.currentTarget as HTMLDivElement;
                  openContextMenu(element);
                })}
                onTouchStart={handleTouchStart(() => {
                  const element = document.activeElement as HTMLDivElement;
                  openContextMenu(element);
                })}
                onTouchEnd={handleTouchEnd()}
              >
                <div className="flex justify-between items-center mb-1">
                  {/* Status indicators - Moved to top left */}
                  <div className="flex items-center">
                    {day.isInBreak && (
                      <div className="mr-1" title="Season Break">
                        <Pause className="h-3 w-3 text-amber-600" />
                      </div>
                    )}
                    {day.isOutsideSeason && (
                      <div className="mr-1" title="Outside Season">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Day number - Top right - Now clickable */}
                  <span
                    className={cn(
                      "text-sm font-medium cursor-pointer hover:bg-primary/20 rounded-full",
                      day.isToday &&
                        "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs",
                      day.isInBreak && "text-amber-700",
                      day.isOutsideSeason && "text-muted-foreground",
                      !day.isToday &&
                        "w-6 h-6 flex items-center justify-center text-xs"
                    )}
                    onClick={(e) => handleDayNumberClick(day.date, e)}
                    title="Click to view day details"
                  >
                    {format(day.date, "d")}
                  </span>
                </div>

                {/* Event count indicator */}
                {day.events.length > 3 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    +{day.events.length - 3} more
                  </div>
                )}

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
                <div className="space-y-1 mt-2">
                  {day.events.slice(0, 3).map((event) => {
                    // Check if this is a session event
                    if (event.type === "session") {
                      return (
                        <DialogEventRenderer
                          key={event.id.toString()}
                          event={event}
                          variant="minimal"
                          onDoubleClick={() => onEventDoubleClick?.(event)}
                        />
                      );
                    }

                    // For other event types, use the regular EventRenderer
                    return (
                      <EventRenderer
                        key={event.id.toString()}
                        event={event}
                        variant="minimal"
                        onClick={(e) => onEventClick?.(e)}
                        onDoubleClick={(e) => onEventDoubleClick?.(e)}
                      />
                    );
                  })}
                </div>
              </div>
            </CalendarContextMenu>
          );
        })}
      </div>
    </div>
  );
}
