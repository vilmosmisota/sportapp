import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  CalendarSeason,
  DateRange,
  SeasonBreak,
} from "../types/calendar.types";

/**
 * Get date range for a given month
 */
export function getMonthDateRange(date: Date): DateRange {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

/**
 * Get date range for a given week
 */
export function getWeekDateRange(date: Date): DateRange {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Start on Monday
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

/**
 * Get date range for a given day
 */
export function getDayDateRange(date: Date): DateRange {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  };
}

/**
 * Calculate duration between two dates in minutes
 */
export function calculateDuration(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Parse date and time strings into a Date object
 */
export function parseDateTime(date: string, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes);
  return result;
}

/**
 * Format time for display
 */
export function formatTime(date: Date): string {
  return format(date, "HH:mm");
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date): string {
  return format(date, "yyyy-MM-dd HH:mm");
}

/**
 * Check if two date ranges overlap
 */
export function dateRangesOverlap(
  range1: DateRange,
  range2: DateRange
): boolean {
  return range1.start <= range2.end && range2.start <= range1.end;
}

/**
 * Convert Season entity to CalendarSeason format
 */
export function seasonToCalendarSeason(season: {
  id: number;
  startDate: Date;
  endDate: Date;
  breaks: { from: Date; to: Date }[];
  customName?: string;
}): CalendarSeason {
  return {
    id: season.id,
    startDate: season.startDate,
    endDate: season.endDate,
    breaks: season.breaks,
    customName: season.customName,
  };
}

/**
 * Check if a date is within the season range
 */
export function isDateInSeason(date: Date, season: CalendarSeason): boolean {
  const dateTime = date.getTime();
  const startTime = season.startDate.getTime();
  const endTime = season.endDate.getTime();

  return dateTime >= startTime && dateTime <= endTime;
}

/**
 * Check if a date is outside the season range
 */
export function isDateOutsideSeason(
  date: Date,
  season: CalendarSeason
): boolean {
  return !isDateInSeason(date, season);
}

/**
 * Check if a date falls within any break period
 */
export function isDateInBreak(date: Date, breaks: SeasonBreak[]): boolean {
  const dateTime = date.getTime();

  return breaks.some((breakPeriod) => {
    const breakStart = breakPeriod.from.getTime();
    const breakEnd = breakPeriod.to.getTime();
    return dateTime >= breakStart && dateTime <= breakEnd;
  });
}

/**
 * Get the break period that contains the given date (if any)
 */
export function getBreakForDate(
  date: Date,
  breaks: SeasonBreak[]
): SeasonBreak | null {
  const dateTime = date.getTime();

  return (
    breaks.find((breakPeriod) => {
      const breakStart = breakPeriod.from.getTime();
      const breakEnd = breakPeriod.to.getTime();
      return dateTime >= breakStart && dateTime <= breakEnd;
    }) || null
  );
}

/**
 * Check if a date is the first day of a break period
 */
export function isBreakStart(date: Date, breaks: SeasonBreak[]): boolean {
  const dateString = format(date, "yyyy-MM-dd");

  return breaks.some((breakPeriod) => {
    const breakStartString = format(breakPeriod.from, "yyyy-MM-dd");
    return dateString === breakStartString;
  });
}

/**
 * Check if a date is the last day of a break period
 */
export function isBreakEnd(date: Date, breaks: SeasonBreak[]): boolean {
  const dateString = format(date, "yyyy-MM-dd");

  return breaks.some((breakPeriod) => {
    const breakEndString = format(breakPeriod.to, "yyyy-MM-dd");
    return dateString === breakEndString;
  });
}
