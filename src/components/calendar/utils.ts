import {
  format,
  isSameDay,
  isAfter,
  isBefore,
  isWithinInterval,
  startOfDay,
  endOfDay,
  endOfWeek,
  startOfWeek,
  addMinutes,
} from "date-fns";
import { CalendarEvent } from "./EventCalendar";
import { EventColors } from "./types";
import { GameStatus } from "@/entities/game/Game.schema";

// Default colors for different event types
export const defaultEventColors: Record<string, EventColors> = {
  game: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
  },
  training: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
  },
};

// Generate status-specific colors for games
export const gameStatusColors: Record<GameStatus, EventColors> = {
  [GameStatus.Scheduled]: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
  },
  [GameStatus.InProgress]: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-300",
  },
  [GameStatus.Completed]: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
  },
  [GameStatus.Canceled]: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
  },
  [GameStatus.Postponed]: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-300",
  },
  [GameStatus.Forfeit]: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-300",
  },
  [GameStatus.Abandoned]: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
  },
  [GameStatus.Draft]: {
    bg: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-300",
  },
};

// Sort events by priority and start time
export const sortEvents = (events: CalendarEvent[]): CalendarEvent[] => {
  return [...events].sort((a, b) => {
    // First by start time
    if (isAfter(a.start, b.start)) return 1;
    if (isBefore(a.start, b.start)) return -1;

    // Then by type (games before trainings)
    if (a.type === "game" && b.type === "training") return -1;
    if (a.type === "training" && b.type === "game") return 1;

    return 0;
  });
};

// Filter events for a specific day
export const getEventsForDay = (
  date: Date,
  events: CalendarEvent[]
): CalendarEvent[] => {
  return events.filter((event) => isSameDay(date, event.start));
};

// Filter events for a time range (week view)
export const getEventsForTimeRange = (
  startDate: Date,
  endDate: Date,
  events: CalendarEvent[]
): CalendarEvent[] => {
  return events.filter(
    (event) =>
      isWithinInterval(event.start, { start: startDate, end: endDate }) ||
      isWithinInterval(event.end, { start: startDate, end: endDate }) ||
      (isBefore(event.start, startDate) && isAfter(event.end, endDate))
  );
};

// Format time for display
export const formatEventTime = (
  start: Date,
  end: Date,
  eventType?: string
): string => {
  // For games, check if end time is within 2 hours of start time (default duration)
  // This indicates the end time wasn't explicitly set
  if (eventType === "game") {
    const defaultEndTime = new Date(start);
    defaultEndTime.setHours(start.getHours() + 2);

    // If end time is exactly 2 hours after start, assume it's the default we added
    if (end.getTime() === defaultEndTime.getTime()) {
      return format(start, "HH:mm");
    }
  }

  return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
};

// Generate time slots for week view
export const generateTimeSlots = (
  startHour: number = 8,
  endHour: number = 22,
  interval: number = 60
): { time: string; hour: number; minute: number }[] => {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      slots.push({
        time: `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`,
        hour,
        minute,
      });
    }
  }
  return slots;
};

/**
 * Merges filtered events with their updated versions from allEvents
 * This ensures filtered events contain the most up-to-date data
 *
 * @param filteredEvents - The currently filtered events
 * @param allEvents - All available events (source of truth)
 * @returns Updated filtered events with fresh data
 */
export function mergeFilteredWithUpdatedEvents(
  filteredEvents: CalendarEvent[],
  allEvents: CalendarEvent[]
): CalendarEvent[] {
  if (!filteredEvents || filteredEvents.length === 0) {
    return allEvents;
  }

  if (!allEvents || allEvents.length === 0) {
    return filteredEvents;
  }

  return filteredEvents.map((filteredEvent) => {
    const updatedEvent = allEvents.find((e) => e.id === filteredEvent.id);
    return updatedEvent || filteredEvent;
  });
}
