import { format, isValid, parse } from "date-fns";
import { Season } from "../season/Season.schema";
import { Session } from "./Session.schema";

/**
 * Format session date for display
 */
export const formatSessionDate = (date: string): string => {
  try {
    const parsedDate = parse(date, "yyyy-MM-dd", new Date());
    if (!isValid(parsedDate)) return date;
    return format(parsedDate, "MMM dd, yyyy");
  } catch {
    return date;
  }
};

/**
 * Format session time for display
 */
export const formatSessionTime = (time: string): string => {
  try {
    const parsedTime = parse(time, "HH:mm", new Date());
    if (!isValid(parsedTime)) return time;
    return format(parsedTime, "h:mm a");
  } catch {
    return time;
  }
};

/**
 * Get session duration in minutes
 */
export const getSessionDuration = (
  startTime: string,
  endTime: string
): number => {
  try {
    const start = parse(startTime, "HH:mm", new Date());
    const end = parse(endTime, "HH:mm", new Date());

    if (!isValid(start) || !isValid(end)) return 0;

    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / (1000 * 60)); // Convert to minutes
  } catch {
    return 0;
  }
};

/**
 * Format session duration for display
 */
export const formatSessionDuration = (
  startTime: string,
  endTime: string
): string => {
  const duration = getSessionDuration(startTime, endTime);

  if (duration === 0) return "Unknown duration";

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

/**
 * Get session time range for display
 */
export const getSessionTimeRange = (session: Session): string => {
  const startTime = formatSessionTime(session.startTime);
  const endTime = formatSessionTime(session.endTime);
  return `${startTime} - ${endTime}`;
};

/**
 * Check if session is in the past
 */
export const isSessionInPast = (session: Session): boolean => {
  try {
    const sessionDate = parse(session.date, "yyyy-MM-dd", new Date());
    const sessionEndTime = parse(session.endTime, "HH:mm", new Date());

    if (!isValid(sessionDate) || !isValid(sessionEndTime)) return false;

    // Combine date and end time
    const sessionEndDateTime = new Date(sessionDate);
    sessionEndDateTime.setHours(
      sessionEndTime.getHours(),
      sessionEndTime.getMinutes()
    );

    return sessionEndDateTime < new Date();
  } catch {
    return false;
  }
};

/**
 * Check if session is currently active
 */
export const isSessionActive = (session: Session): boolean => {
  try {
    const sessionDate = parse(session.date, "yyyy-MM-dd", new Date());
    const sessionStartTime = parse(session.startTime, "HH:mm", new Date());
    const sessionEndTime = parse(session.endTime, "HH:mm", new Date());

    if (
      !isValid(sessionDate) ||
      !isValid(sessionStartTime) ||
      !isValid(sessionEndTime)
    ) {
      return false;
    }

    const now = new Date();
    const today = format(now, "yyyy-MM-dd");

    // Check if session is today
    if (session.date !== today) return false;

    // Combine date and times
    const sessionStartDateTime = new Date(sessionDate);
    sessionStartDateTime.setHours(
      sessionStartTime.getHours(),
      sessionStartTime.getMinutes()
    );

    const sessionEndDateTime = new Date(sessionDate);
    sessionEndDateTime.setHours(
      sessionEndTime.getHours(),
      sessionEndTime.getMinutes()
    );

    return now >= sessionStartDateTime && now <= sessionEndDateTime;
  } catch {
    return false;
  }
};

/**
 * Sort sessions by date and start time
 */
export const sortSessionsByDateTime = (sessions: Session[]): Session[] => {
  return [...sessions].sort((a, b) => {
    // First sort by date
    const dateComparison = a.date.localeCompare(b.date);
    if (dateComparison !== 0) return dateComparison;

    // Then sort by start time
    return a.startTime.localeCompare(b.startTime);
  });
};

/**
 * Group sessions by date
 */
export const groupSessionsByDate = (
  sessions: Session[]
): Record<string, Session[]> => {
  return sessions.reduce((groups, session) => {
    const date = session.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, Session[]>);
};

/**
 * Generate recurring sessions based on a start date with weekly recurrence
 * Respects season boundaries and excludes break periods
 */
export const generateRecurringSessionsFromStartDate = (
  startDate: Date,
  season: Season,
  sessionTemplate: {
    startTime: string;
    endTime: string;
    location?: any;
    groupId: number;
    seasonId: number;
  }
): {
  sessions: Omit<Session, "id" | "tenantId">[];
  isStartDateValid: boolean;
  validationMessage?: string;
} => {
  const startTime = startDate.getTime();
  const seasonStart = season.startDate.getTime();
  const seasonEnd = season.endDate.getTime();

  if (startTime < seasonStart || startTime > seasonEnd) {
    return {
      sessions: [],
      isStartDateValid: false,
      validationMessage: "Start date is outside the season range",
    };
  }

  const isStartDateInBreak = season.breaks.some((breakPeriod) => {
    const breakStart = breakPeriod.from.getTime();
    const breakEnd = breakPeriod.to.getTime();
    return startTime >= breakStart && startTime <= breakEnd;
  });

  if (isStartDateInBreak) {
    return {
      sessions: [],
      isStartDateValid: false,
      validationMessage: "Start date falls during a season break",
    };
  }

  const sessions: Omit<Session, "id" | "tenantId">[] = [];
  const targetDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentDate = new Date(startDate);

  while (currentDate <= season.endDate) {
    if (currentDate.getDay() === targetDayOfWeek) {
      const currentTime = currentDate.getTime();
      const isInBreak = season.breaks.some((breakPeriod) => {
        const breakStart = breakPeriod.from.getTime();
        const breakEnd = breakPeriod.to.getTime();
        return currentTime >= breakStart && currentTime <= breakEnd;
      });

      if (!isInBreak) {
        sessions.push({
          date: currentDate.toISOString().split("T")[0], // YYYY-MM-DD format
          startTime: sessionTemplate.startTime,
          endTime: sessionTemplate.endTime,
          location: sessionTemplate.location || null,
          groupId: sessionTemplate.groupId,
          seasonId: sessionTemplate.seasonId,
          isAggregated: false,
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    sessions,
    isStartDateValid: true,
    validationMessage: `Generated ${sessions.length} sessions for ${getDayName(
      targetDayOfWeek
    )}s`,
  };
};

/**
 * Helper function to get day name from day number
 */
const getDayName = (dayNumber: number): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayNumber] || "Unknown";
};
