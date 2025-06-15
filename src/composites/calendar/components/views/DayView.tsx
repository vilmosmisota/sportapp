"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/libs/tailwind/utils";
import {
  addDays,
  format,
  getHours,
  getMinutes,
  isSameDay,
  isToday,
  subDays,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pause,
} from "lucide-react";
import { useMemo } from "react";
import { DialogEventRenderer } from "../../components/DialogEventRenderer";
import { useCalendarInteraction } from "../../hooks/useCalendarInteraction";
import { CalendarEvent, CalendarSeason } from "../../types/calendar.types";
import { isDateInBreak, isDateOutsideSeason } from "../../utils/date.utils";
import { EventRenderer } from "../EventRenderer";

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

interface DayViewProps<TEvent extends CalendarEvent> {
  currentDate: Date;
  events: TEvent[];
  season?: CalendarSeason;
  onEventClick?: (event: TEvent) => void;
  onEventDoubleClick?: (event: TEvent) => void;
  onDateClick?: (date: Date) => void;
  onAddSession?: (date: Date) => void;
  onDateChange?: (date: Date) => void;
  selectedDate?: Date | null;
  className?: string;
}

export function DayView<TEvent extends CalendarEvent>({
  currentDate,
  events,
  season,
  onEventClick,
  onEventDoubleClick,
  onDateClick,
  onAddSession,
  onDateChange,
  selectedDate,
  className,
}: DayViewProps<TEvent>) {
  const { handleDoubleClick, handleTouchStart, handleTouchEnd } =
    useCalendarInteraction();

  // Generate time slots for the day view (from 6am to 10pm by default)
  const timeSlots = useMemo(() => generateTimeSlots(6, 22), []);

  // Define constants for time layout
  const visibleHoursStart = 6; // 6am
  const visibleHoursEnd = 22; // 10pm
  const totalHours = visibleHoursEnd - visibleHoursStart;
  const hourHeight = 60; // Height of each hour in pixels
  const gridHeight = totalHours * hourHeight; // Total grid height

  const today = new Date();

  // Calculate current time indicator position
  const nowHour = getHours(today);
  const nowMinute = getMinutes(today);

  // Calculate position in pixels from the top
  const nowPosition =
    nowHour >= visibleHoursStart && nowHour < visibleHoursEnd
      ? (nowHour - visibleHoursStart) * hourHeight +
        (nowMinute / 60) * hourHeight
      : -1;

  // Helper functions for date navigation
  const handlePreviousDay = () => {
    const previousDay = subDays(currentDate, 1);
    if (onDateChange) {
      onDateChange(previousDay);
    }
  };

  const handleNextDay = () => {
    const nextDay = addDays(currentDate, 1);
    if (onDateChange) {
      onDateChange(nextDay);
    }
  };

  // Generate dates for the day selector (3 days before, current day, 3 days after)
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = -3; i <= 3; i++) {
      dates.push(addDays(currentDate, i));
    }
    return dates;
  }, [currentDate]);

  // Get events for the current day
  const dayEvents = useMemo(() => {
    return events.filter((event) => isSameDay(event.startDate, currentDate));
  }, [events, currentDate]);

  // Calculate pixel-based position for events
  const getEventPosition = (event: TEvent) => {
    const startHour = getHours(event.startDate);
    const startMinute = getMinutes(event.startDate);
    const endHour = getHours(event.endDate);
    const endMinute = getMinutes(event.endDate);

    // Check if event is outside the visible range
    if (endHour < visibleHoursStart || startHour >= visibleHoursEnd) {
      return null;
    }

    // Calculate start position (in hours from visibleHoursStart)
    const startHoursFromStart = Math.max(0, startHour - visibleHoursStart);
    const startMinutesFraction = startMinute / 60;

    // Calculate end position (in hours from visibleHoursStart)
    const endHoursFromStart = Math.min(totalHours, endHour - visibleHoursStart);
    const endMinutesFraction = endMinute / 60;

    // Calculate pixel positions
    const topPixels = (startHoursFromStart + startMinutesFraction) * hourHeight;
    const heightPixels =
      (endHoursFromStart +
        endMinutesFraction -
        (startHoursFromStart + startMinutesFraction)) *
      hourHeight;

    return {
      top: `${topPixels}px`,
      height: `${heightPixels}px`,
    };
  };

  // Check if current date is in a break or outside season
  const isInBreak = season ? isDateInBreak(currentDate, season.breaks) : false;
  const isOutsideSeason = season
    ? isDateOutsideSeason(currentDate, season)
    : false;

  return (
    <div className={cn("h-full flex flex-col relative  p-4", className)}>
      {/* Day selector */}
      <div className="mb-4 border rounded-lg shadow-sm overflow-hidden bg-card">
        <div className="w-full grid grid-cols-7 gap-0 px-3 py-3 relative">
          {weekDates.map((date) => {
            const isSelected = isSameDay(date, currentDate);
            const isHighlighted = selectedDate
              ? isSameDay(date, selectedDate)
              : false;
            const isTodayDate = isToday(date);
            const isDateBreak = season
              ? isDateInBreak(date, season.breaks)
              : false;
            const isDateOutside = season
              ? isDateOutsideSeason(date, season)
              : false;

            return (
              <button
                key={format(date, "yyyy-MM-dd")}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-0 mx-auto w-12 h-16 transition-all relative",
                  isSelected && "text-primary"
                )}
                onClick={() => onDateChange?.(date)}
              >
                <span className="text-xs text-muted-foreground">
                  {format(date, "EEE")}
                </span>
                <div
                  className={cn(
                    "flex items-center justify-center w-9 h-9 text-base font-semibold rounded-full mt-1",
                    isSelected && "bg-primary text-primary-foreground",
                    !isSelected && isTodayDate && "border border-primary",
                    !isSelected && isHighlighted && "border-2 border-primary",
                    !isSelected && isDateBreak && "text-amber-800",
                    !isSelected && isDateOutside && "text-gray-500",
                    !isSelected && "hover:bg-accent"
                  )}
                >
                  {format(date, "d")}
                </div>
                {isDateBreak && (
                  <div className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
                {isDateOutside && (
                  <div className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-gray-400" />
                )}
              </button>
            );
          })}

          {/* Previous/Next Day buttons*/}
          <div className="absolute left-1 top-[50%] z-10 -translate-y-1/2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousDay}
              className="h-7 w-7 rounded-full shadow-sm"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="sr-only">Previous day</span>
            </Button>
          </div>

          <div className="absolute right-1 top-[50%] z-10 -translate-y-1/2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextDay}
              className="h-7 w-7 rounded-full shadow-sm"
            >
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="sr-only">Next day</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Date header with status indicators */}
      <div
        className={cn(
          "py-1.5 mb-4 flex flex-wrap items-center justify-between",
          isInBreak && "bg-amber-50/70 rounded-lg px-2 md:px-3",
          isOutsideSeason && "bg-muted/30 rounded-lg px-2 md:px-3"
        )}
      >
        <div className="font-medium text-sm md:text-base flex items-center gap-1 flex-wrap">
          <span className="hidden xs:inline">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </span>
          <span className="inline xs:hidden">
            {format(currentDate, "EEE, MMM d")}
          </span>
          {isInBreak && (
            <span className="inline-flex items-center text-amber-500 text-xs ml-1 md:ml-2">
              <Pause className="h-3 w-3 md:h-3.5 md:w-3.5 mr-0.5 md:mr-1" />
              <span className="hidden xs:inline">Season Break</span>
              <span className="inline xs:hidden">Break</span>
            </span>
          )}
          {isOutsideSeason && (
            <span className="inline-flex items-center text-gray-400 text-xs ml-1 md:ml-2">
              <CalendarIcon className="h-3 w-3 md:h-3.5 md:w-3.5 mr-0.5 md:mr-1" />
              <span className="hidden xs:inline">Outside Season</span>
              <span className="inline xs:hidden">Outside</span>
            </span>
          )}
        </div>
      </div>

      {/* Split view with time grid and event details */}
      <div className="flex flex-1 gap-4">
        {/* Time grid - half width */}
        <div
          className="border rounded-lg shadow-sm overflow-hidden w-1/2"
          style={{ height: `${gridHeight}px` }}
          title="Time grid"
        >
          <div className="relative w-full h-full">
            {/* Current time indicator */}
            {isToday(currentDate) && nowPosition >= 0 && (
              <div
                className="absolute left-0 right-0 border-t-2 border-red-500 z-30 pointer-events-none"
                style={{ top: `${nowPosition}px` }}
              >
                <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
              </div>
            )}

            {/* Time slots */}
            {timeSlots.map((slot, index) => (
              <div
                key={slot.time}
                className={cn(
                  "grid grid-cols-[70px_1fr] border-b absolute w-full",
                  index % 2 === 0 ? "border-t border-border/50" : ""
                )}
                style={{
                  top: `${index * hourHeight}px`,
                  height: `${hourHeight}px`,
                }}
              >
                <div className="text-xs text-muted-foreground py-1 px-3">
                  {slot.time}
                </div>
                <div></div>
              </div>
            ))}

            {/* Events */}
            {dayEvents.map((event) => {
              const position = getEventPosition(event);
              if (!position) return null;

              // Check if this is a session event
              if (event.type === "session") {
                return (
                  <DialogEventRenderer
                    key={event.id.toString()}
                    event={event}
                    variant="full"
                    onDoubleClick={() => onEventDoubleClick?.(event)}
                    className="mb-2"
                  />
                );
              }

              // For other event types, use the regular EventRenderer
              return (
                <div
                  key={event.id}
                  className="absolute z-20 left-[70px] right-2 px-1 rounded border border-primary/20 bg-primary/10"
                  style={position}
                  onClick={() => onEventClick?.(event)}
                >
                  <div className="h-full flex items-center overflow-hidden shadow-sm p-1 text-xs">
                    <EventRenderer
                      event={event}
                      variant="full"
                      onClick={(e) => onEventClick?.(e)}
                      onDoubleClick={(e) => onEventDoubleClick?.(e)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed event cards panel */}
        <div className="w-1/2 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground mx-1">
              Events for {format(currentDate, "MMMM d, yyyy")}
            </h3>

            {dayEvents.length > 0 ? (
              <div className="space-y-4">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border rounded-md p-3 shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(event.startDate, "h:mm a")} -{" "}
                        {format(event.endDate, "h:mm a")}
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(event.startDate, "h:mm a")} -{" "}
                        {format(event.endDate, "h:mm a")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center border rounded-md">
                <div className="pt-6">
                  <CalendarIcon className="h-8 w-8 mb-3 text-muted-foreground/50 mx-auto" />
                  <div className="text-muted-foreground mb-1">
                    No events scheduled for this day
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Events will appear here when they are scheduled
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate time slots
function generateTimeSlots(startHour: number, endHour: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const amPm = hour < 12 ? "AM" : "PM";
    slots.push({
      time: `${formattedHour}:00 ${amPm}`,
      hour,
      minute: 0,
    });
  }
  return slots;
}
