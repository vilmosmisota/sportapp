import { useQuery } from "@tanstack/react-query";
import { format, parse, addHours } from "date-fns";
import { Training } from "@/entities/training/Training.schema";
import { CalendarEvent } from "../EventCalendar";
import { getTrainingsByDateRange } from "@/entities/training/Training.services";
import { useSupabase } from "@/libs/supabase/useSupabase";
import {
  getDisplayAgeGroup,
  getDisplayGender,
} from "@/entities/team/Team.schema";
import { queryKeys } from "@/cacheKeys/cacheKeys";
import { Meta } from "@/entities/common/Meta.schema";

// No need for a separate interface as Training already has meta
// We'll use the standard Training type which already includes meta

// Transformer function for trainings
export const transformTrainingsToEvents = (
  trainings: Training[] = []
): CalendarEvent[] => {
  return trainings.map((training) => {
    try {
      // Handle date properly
      const trainingDate =
        typeof training.date === "string"
          ? new Date(training.date)
          : training.date;

      // Get the time part only (remove seconds if present)
      const startTime = training.startTime.substring(0, 5); // Extract HH:mm from HH:mm:ss

      // Create start time by combining date and start time
      const startDateTime = parse(
        `${format(trainingDate, "yyyy-MM-dd")} ${startTime}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );

      // Parse end time
      let endDateTime;
      if (training.endTime) {
        const endTime = training.endTime.substring(0, 5); // Extract HH:mm from HH:mm:ss
        endDateTime = parse(
          `${format(trainingDate, "yyyy-MM-dd")} ${endTime}`,
          "yyyy-MM-dd HH:mm",
          new Date()
        );
      } else {
        endDateTime = addHours(startDateTime, 1.5); // Default 1.5 hours if no end time
      }

      // Generate title based on team
      let title = "Training";
      if (training.team) {
        const ageGroup = getDisplayAgeGroup(training.team.age);
        const gender = getDisplayGender(
          training.team.gender,
          training.team.age
        );
        const skill = training.team.skill || "";

        // Format with bullet points: "U18 • Boys • Beginner"
        if (ageGroup && gender) {
          if (skill) {
            title = `${ageGroup} • ${gender} • ${skill}`;
          } else {
            title = `${ageGroup} • ${gender}`;
          }
        }
      }

      const primaryColor = training.team?.appearance?.color || "green";

      return {
        id: `training-${training.id}`,
        type: "training",
        title,
        start: startDateTime,
        end: endDateTime,
        color: primaryColor,
        data: training,
      };
    } catch (error) {
      console.error("Error transforming training to event:", error, training);
      // Return a fallback event instead of crashing
      return {
        id: `training-${training.id || "unknown"}`,
        type: "training",
        title: "Training (error)",
        start: new Date(),
        end: new Date(new Date().getTime() + 90 * 60 * 1000), // 1.5 hours later
        color: "red", // Indicate error with red
        data: training,
      };
    }
  });
};

/**
 * Simplified hook to fetch and transform trainings into calendar events for a given month
 */
export function useTrainingsCalendarEvents(
  tenantId: string,
  startDate: Date, // First day of month
  endDate: Date, // Last day of month
  seasonId: number,
  enabled = true
) {
  const monthKey = format(startDate, "yyyy-MM");

  // Use the properly defined query key from the central cache keys file
  const queryKey = queryKeys.training.calendarEvents(
    tenantId,
    monthKey,
    seasonId
  );

  // Get the Supabase client
  const client = useSupabase();

  return useQuery({
    queryKey,
    queryFn: async () => {
      return await getTrainingsByDateRange(
        client,
        tenantId,
        startDate,
        endDate,
        seasonId
      );
    },
    select: transformTrainingsToEvents,
    enabled: enabled && !!seasonId && !!tenantId,
  });
}
