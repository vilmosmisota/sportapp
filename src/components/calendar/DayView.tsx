"use client";

import * as React from "react";
import {
  format,
  isToday,
  isSameDay,
  isWithinInterval,
  getHours,
  getMinutes,
  addDays,
  subDays,
  isBefore,
  isAfter,
  startOfDay,
} from "date-fns";
import { cn } from "@/libs/tailwind/utils";
import { CalendarEvent } from "./EventCalendar";
import { EventItem } from "./EventItem";
import { CalendarEventCard } from "./CalendarEventCard";
import {
  generateTimeSlots,
  getEventsForDay,
  sortEvents,
  gameStatusColors,
  defaultEventColors,
} from "./utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Trophy,
  MoreVertical,
  ClipboardList,
  Edit,
  Trash2,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  isLoading?: boolean;
  seasonBreaks?: { from: Date; to: Date }[];
  seasonDateRange?: { startDate: Date; endDate: Date } | null;
  onDateChange?: (date: Date) => void;
  showEmptyTimeSlots?: boolean;
  activeDay?: Date | null;
  setActiveDay?: (date: Date | null) => void;
  onDayContextMenu?: (date: Date, event: React.MouseEvent) => void;
}

export function DayView({
  currentDate,
  events,
  onEventClick,
  isLoading = false,
  seasonBreaks = [],
  seasonDateRange = null,
  onDateChange,
  showEmptyTimeSlots = true,
  activeDay,
  setActiveDay,
  onDayContextMenu,
}: DayViewProps) {
  // Create time slots for the day view (from 6am to 10pm by default)
  const timeSlots = generateTimeSlots(6, 22, 60);

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

    // Update activeDay when navigating
    if (setActiveDay) {
      setActiveDay(previousDay);
    }
  };

  const handleNextDay = () => {
    const nextDay = addDays(currentDate, 1);
    if (onDateChange) {
      onDateChange(nextDay);
    }

    // Update activeDay when navigating
    if (setActiveDay) {
      setActiveDay(nextDay);
    }
  };

  const handleDayClick = (date: Date) => {
    if (onDateChange) {
      onDateChange(date);
    }

    // Update activeDay when clicking a day
    if (setActiveDay) {
      setActiveDay(date);
    }
  };

  // Navigate to today
  const handleTodayClick = () => {
    const today = new Date();
    if (onDateChange) {
      onDateChange(today);
    }

    // Update activeDay when navigating to today
    if (setActiveDay) {
      setActiveDay(today);
    }
  };

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

  // Get events for the current day
  const dayEvents = sortEvents(getEventsForDay(currentDate, events));

  // Calculate pixel-based position for events
  const getEventPosition = (event: CalendarEvent) => {
    const startHour = getHours(event.start);
    const startMinute = getMinutes(event.start);
    const endHour = getHours(event.end);
    const endMinute = getMinutes(event.end);

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

  // Generate dates for the day selector (3 days before, current day, 3 days after)
  const weekDates = React.useMemo(() => {
    const dates: Date[] = [];
    for (let i = -3; i <= 3; i++) {
      dates.push(addDays(currentDate, i));
    }
    return dates;
  }, [currentDate]);

  // Check if current date is in a break or outside season
  const isInBreak = isDateInBreak(currentDate);
  const isOutsideSeason = isDateOutsideSeason(currentDate);

  // Handle double-click on the time grid
  const handleGridDoubleClick = (event: React.MouseEvent) => {
    if (onDayContextMenu && !isInBreak && !isOutsideSeason) {
      // Position the context menu at the click position
      onDayContextMenu(currentDate, event);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col relative">
        {/* Day selector skeleton */}
        <div className="mb-4 border rounded-lg shadow-sm overflow-hidden bg-card">
          <div className="w-full grid grid-cols-7 gap-0 px-3 py-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-2 px-0 mx-auto w-12 h-16"
              >
                <Skeleton className="h-3 w-8 mb-1" />
                <Skeleton className="h-9 w-9 rounded-full mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation button skeletons */}
        <div className="absolute left-1 top-[calc(3.5rem)] z-10">
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>

        <div className="absolute right-1 top-[calc(3.5rem)] z-10">
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>

        {/* Date header skeleton */}
        <Skeleton className="h-6 w-48 mb-4" />

        {/* Time grid skeleton */}
        <div className="flex-1 border rounded-lg shadow-sm overflow-hidden">
          <div className="grid gap-0">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="grid grid-cols-[70px_1fr] border-b">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Day selector */}
      <div className="mb-4 border rounded-lg shadow-sm overflow-hidden bg-card">
        <div className="w-full grid grid-cols-7 gap-0 px-3 py-3 relative">
          {weekDates.map((date) => {
            const isSelected = isSameDay(date, currentDate);
            const isTodayDate = isToday(date);
            const isDateBreak = isDateInBreak(date);
            const isDateOutside = isDateOutsideSeason(date);

            return (
              <button
                key={format(date, "yyyy-MM-dd")}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-0 mx-auto w-12 h-16 transition-all relative",
                  isSelected && "text-primary"
                )}
                onClick={() => handleDayClick(date)}
              >
                <span className="text-xs text-muted-foreground">
                  {format(date, "EEE")}
                </span>
                <div
                  className={cn(
                    "flex items-center justify-center w-9 h-9 text-base font-semibold rounded-full mt-1",
                    isSelected && "bg-primary text-primary-foreground",
                    !isSelected && isTodayDate && "border border-primary",
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
          isOutsideSeason && "bg-gray-100 rounded-lg px-2 md:px-3"
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
          onDoubleClick={handleGridDoubleClick}
          title={
            !isInBreak && !isOutsideSeason
              ? "Double-click to add an event"
              : undefined
          }
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
                  showEmptyTimeSlots
                    ? "border-t border-border/50"
                    : slot.hour % 2 === 0
                    ? "border-t border-border/50"
                    : ""
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
              const eventColorKey =
                event.type as keyof typeof defaultEventColors;
              const eventColor =
                event.color ||
                defaultEventColors[eventColorKey] ||
                defaultEventColors.default;

              return (
                <div
                  key={event.id}
                  className="absolute z-20 left-[70px] right-2 px-1 rounded"
                  style={{
                    ...position,
                    backgroundColor: `var(--${eventColor}-50)`,
                    borderColor: `var(--${eventColor}-200)`,
                    color: `var(--${eventColor}-foreground)`,
                  }}
                  onClick={() => onEventClick?.(event)}
                >
                  <EventItem
                    event={event}
                    onClick={onEventClick}
                    variant="compact"
                    className="h-full flex items-center overflow-hidden shadow-sm"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed event cards panel */}
        <div
          className="w-1/2 overflow-y-auto"
          onDoubleClick={handleGridDoubleClick}
          title={
            !isInBreak && !isOutsideSeason
              ? "Double-click to add an event"
              : undefined
          }
        >
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground mx-1">
              Events for {format(currentDate, "MMMM d, yyyy")}
            </h3>

            {dayEvents.length > 0 ? (
              <div className="space-y-4">
                {dayEvents.map((event) => (
                  <CalendarEventCard
                    key={event.id}
                    event={event}
                    onEventClick={onEventClick}
                  />
                ))}
              </div>
            ) : (
              <Card
                className="flex flex-col items-center justify-center py-6 text-center"
                onDoubleClick={handleGridDoubleClick}
                title={
                  !isInBreak && !isOutsideSeason
                    ? "Double-click to add an event"
                    : undefined
                }
              >
                <CardContent className="pt-6">
                  <CalendarIcon className="h-8 w-8 mb-3 text-muted-foreground/50 mx-auto" />
                  <div className="text-muted-foreground mb-1">
                    No events scheduled for this day
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Events will appear here when they are scheduled
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
