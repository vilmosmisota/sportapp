import { Season } from "@/entities/season/Season.schema";
import { Session } from "@/entities/session/Session.schema";
import { generateRecurringSessionsFromStartDate } from "@/entities/session/Session.utils";
import { Location } from "@/entities/shared/Location.schema";
import { format, isAfter, isBefore } from "date-fns";
import { RecurrenceConfig, SessionFormData } from "../types/session-form.types";

/**
 * Generate sessions based on form data and recurrence configuration
 */
export function generateSessionsFromFormData(
  formData: SessionFormData,
  season: Season,
  locations: Location[]
): {
  sessions: Omit<Session, "id" | "tenantId">[];
  count: number;
  isValid: boolean;
  validationMessage?: string;
} {
  const location = locations.find(
    (l) =>
      (l.id && l.id === formData.locationId) ||
      (!l.id && formData.locationId === `loc-${locations.indexOf(l)}`)
  );

  if (!location) {
    return {
      sessions: [],
      count: 0,
      isValid: false,
      validationMessage: "Selected location not found",
    };
  }

  const groupId = parseInt(formData.groupId);
  if (isNaN(groupId)) {
    return {
      sessions: [],
      count: 0,
      isValid: false,
      validationMessage: "Invalid group selection",
    };
  }

  // Handle single session
  if (formData.recurrence.type === "once") {
    return {
      sessions: [
        {
          date: format(formData.date, "yyyy-MM-dd"),
          startTime: formData.startTime,
          endTime: formData.endTime,
          location,
          groupId,
          seasonId: season.id,
          isAggregated: false,
        },
      ],
      count: 1,
      isValid: true,
    };
  }

  // Handle recurring sessions - repeat the same day of week as the selected date
  const selectedDay = formData.date.getDay(); // Get day of week from selected date
  const selectedDays = [selectedDay];

  // For repeat type, always go until end of season
  const endDate = season.endDate;

  // Use existing utility with modified season
  const modifiedSeason: Season = {
    ...season,
    endDate,
  };

  const result = generateRecurringSessionsFromStartDate(
    formData.date,
    modifiedSeason,
    {
      startTime: formData.startTime,
      endTime: formData.endTime,
      location,
      groupId,
      seasonId: season.id,
    },
    selectedDays
  );

  return {
    sessions: result.sessions,
    count: result.sessions.length,
    isValid: result.isStartDateValid,
    validationMessage: result.validationMessage,
  };
}

/**
 * Validate session form data
 */
export function validateSessionFormData(
  formData: SessionFormData,
  season: Season
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic validation
  if (!formData.groupId) {
    errors.push("Group is required");
  }

  if (!formData.startTime) {
    errors.push("Start time is required");
  }

  if (!formData.endTime) {
    errors.push("End time is required");
  }

  if (!formData.locationId) {
    errors.push("Location is required");
  }

  if (!formData.date) {
    errors.push("Date is required");
  }

  // Time validation
  if (formData.startTime && formData.endTime) {
    if (formData.startTime >= formData.endTime) {
      errors.push("End time must be after start time");
    }
  }

  // Date validation
  if (formData.date) {
    if (isBefore(formData.date, season.startDate)) {
      errors.push("Date cannot be before season start");
    }
    if (isAfter(formData.date, season.endDate)) {
      errors.push("Date cannot be after season end");
    }
  }

  // No additional recurrence validation needed - repeat always goes to end of season

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get duration description for display
 */
export function getDurationDescription(recurrence: RecurrenceConfig): string {
  if (recurrence.type === "once") {
    return "One-time session";
  }

  // For repeat type, it's always weekly until end of season
  return "Weekly until end of season";
}

/**
 * Get estimated session count for display
 */
export function getEstimatedSessionCount(
  startDate: Date,
  recurrence: RecurrenceConfig,
  season: Season
): number {
  if (recurrence.type === "once") {
    return 1;
  }

  // For repeat type, always go until end of season
  const endDate = season.endDate;

  // Simple estimation: 1 session per week (same day each week)
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const weeks = Math.ceil(totalDays / 7);

  return Math.max(1, weeks);
}
