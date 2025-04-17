import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TrainingForm,
  UpdateTrainingPattern,
  DeleteTrainingPattern,
} from "./Training.schema";
import {
  addTraining,
  updateTraining,
  deleteTraining,
  addTrainingBatch,
  updateTrainingPattern,
  deleteTrainingPattern,
} from "./Training.services";
import { TrainingLocation } from "@/entities/tenant/Tenant.schema";
import { Json } from "@/db/database.types";
import { Meta } from "../common/Meta.schema";
import { format } from "date-fns";

/**
 * Helper function to invalidate training calendar queries for a specific month
 */
const invalidateTrainingCalendarQueries = (
  queryClient: any,
  tenantId: string,
  date: Date,
  seasonId?: number
) => {
  // Invalidate all training queries
  queryClient.invalidateQueries({
    queryKey: [queryKeys.training.all, tenantId],
  });

  queryClient.invalidateQueries({
    queryKey: [queryKeys.training.grouped, tenantId],
  });

  queryClient.invalidateQueries({
    queryKey: queryKeys.training.allCalendarEvents(tenantId),
  });

  // Get the month key for the specific month of the event
  const monthKey = format(date, "yyyy-MM");

  // Invalidate the specific month's cache with seasonId
  if (seasonId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.training.calendarEvents(tenantId, monthKey, seasonId),
    });
  }

  // Also invalidate without seasonId in case there are queries without it
  queryClient.invalidateQueries({
    queryKey: queryKeys.training.calendarEvents(tenantId, monthKey),
  });

  // Invalidate date range queries that might include this date
  queryClient.invalidateQueries({
    queryKey: [queryKeys.training.byDateRange, tenantId],
  });

  // Also invalidate adjacent months in case the event is near month boundaries
  const nextMonth = new Date(date);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const prevMonth = new Date(date);
  prevMonth.setMonth(prevMonth.getMonth() - 1);

  const nextMonthKey = format(nextMonth, "yyyy-MM");
  const prevMonthKey = format(prevMonth, "yyyy-MM");

  // Invalidate next month with seasonId
  if (seasonId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.training.calendarEvents(
        tenantId,
        nextMonthKey,
        seasonId
      ),
    });
  }

  // Invalidate next month without seasonId
  queryClient.invalidateQueries({
    queryKey: queryKeys.training.calendarEvents(tenantId, nextMonthKey),
  });

  // Invalidate previous month with seasonId
  if (seasonId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.training.calendarEvents(
        tenantId,
        prevMonthKey,
        seasonId
      ),
    });
  }

  // Invalidate previous month without seasonId
  queryClient.invalidateQueries({
    queryKey: queryKeys.training.calendarEvents(tenantId, prevMonthKey),
  });

  // Also invalidate the day range queries since they might include this training
  queryClient.invalidateQueries({
    queryKey: [queryKeys.training.byDayRange(7)],
  });
};

export const useAddTraining = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TrainingForm) => addTraining(client, data, tenantId),
    onSuccess: (_, data) => {
      // Use the date from the training for targeted cache invalidation
      if (data.date) {
        const trainingDate =
          typeof data.date === "string" ? new Date(data.date) : data.date;

        invalidateTrainingCalendarQueries(
          queryClient,
          tenantId,
          trainingDate,
          data.seasonId
        );
      } else {
        // Fallback to broader invalidation if no date is available
        queryClient.invalidateQueries({
          queryKey: [queryKeys.training.all, tenantId],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeys.training.grouped, tenantId],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.training.allCalendarEvents(tenantId),
        });
      }
    },
  });
};

export const useAddTrainingBatch = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      trainings,
      seasonId,
    }: {
      trainings: Array<{
        date: string;
        startTime: string;
        endTime: string;
        location: TrainingLocation;
        teamId: number | null;
        meta?: Meta;
      }>;
      seasonId: number;
    }) => {
      // Convert trainings array to the format expected by the service function
      const batchData = {
        dates: trainings.map((t) => t.date),
        startTime: trainings[0]?.startTime || "",
        endTime: trainings[0]?.endTime || "",
        location: trainings[0]?.location,
        teamId: trainings[0]?.teamId || null,
        seasonId: seasonId,
        meta: trainings[0]?.meta || null,
      };

      return addTrainingBatch(client, batchData, tenantId);
    },
    onSuccess: (_, { trainings }) => {
      // Since we're creating multiple trainings, invalidate broadly
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.all, tenantId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.grouped, tenantId],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.training.allCalendarEvents(tenantId),
      });

      // For batch operations, also invalidate specific months for each training
      if (trainings && trainings.length > 0) {
        // Create a Set to track unique months we've already invalidated
        const invalidatedMonths = new Set<string>();

        trainings.forEach((training) => {
          if (training.date) {
            const trainingDate = new Date(training.date);
            const monthKey = format(trainingDate, "yyyy-MM");

            // Only invalidate each month once
            if (!invalidatedMonths.has(monthKey)) {
              invalidatedMonths.add(monthKey);

              queryClient.invalidateQueries({
                queryKey: queryKeys.training.calendarEvents(tenantId, monthKey),
              });
            }
          }
        });
      }
    },
  });
};

export const useUpdateTraining = (trainingId: number, tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TrainingForm) =>
      updateTraining(client, trainingId, data, tenantId),
    onSuccess: (updatedTraining, data) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.detail(tenantId, trainingId.toString())],
      });

      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.byDayRange(7)],
      });

      const trainingDate = updatedTraining.date;
      const seasonId = updatedTraining.seasonId;

      invalidateTrainingCalendarQueries(
        queryClient,
        tenantId,
        trainingDate,
        seasonId
      );
    },
  });
};

export const useDeleteTraining = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  interface TrainingData {
    date: string;
    seasonId: number;
  }

  return useMutation({
    mutationFn: async (trainingId: number) => {
      try {
        // First fetch the training to get its date before deleting it
        const { data, error } = await client
          .from("trainings")
          .select("date, seasonId")
          .eq("id", trainingId)
          .eq("tenantId", tenantId)
          .single();

        if (error) {
          console.error("Error fetching training before deletion:", error);
        }

        // Then delete the training
        const result = await deleteTraining(client, trainingId, tenantId);

        // Return both the deletion result and the training data for cache invalidation
        return {
          result,
          trainingData: data as TrainingData | null,
        };
      } catch (error) {
        console.error("Error in delete training mutation:", error);
        // Re-throw the error to be handled by the mutation
        throw error;
      }
    },
    onSuccess: (data) => {
      // Use the helper function to invalidate all relevant caches
      if (data?.trainingData?.date) {
        const trainingDate = new Date(data.trainingData.date);
        invalidateTrainingCalendarQueries(
          queryClient,
          tenantId,
          trainingDate,
          data.trainingData.seasonId
        );
      } else {
        // Fallback: If we couldn't get the training data, invalidate broader caches
        queryClient.invalidateQueries({
          queryKey: [queryKeys.training.all],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.training.allCalendarEvents(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeys.team.all],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeys.season.all],
        });
      }
    },
  });
};

export const useUpdateTrainingPattern = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTrainingPattern) =>
      updateTrainingPattern(client, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.all],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.byPattern],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.grouped],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.training.allCalendarEvents(tenantId),
      });
    },
  });
};

export const useDeleteTrainingPattern = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteTrainingPattern) =>
      deleteTrainingPattern(client, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.all],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.byPattern],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.grouped],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.training.allCalendarEvents(tenantId),
      });
    },
  });
};

export const useUpdateTrainingProperties = (
  trainingId: number,
  tenantId: string
) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      date?: string;
      startTime?: string;
      endTime?: string;
      location?: any;
      meta?: Meta;
    }) => {
      const { error } = await client
        .from("trainings")
        .update(updates)
        .eq("id", trainingId)
        .eq("tenantId", tenantId);

      if (error) throw error;
      return { ...updates, id: trainingId };
    },
    onSuccess: (data) => {
      // Invalidate specific training detail
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.detail(tenantId, trainingId.toString())],
      });

      // Use date for targeted invalidation if available
      if (data.date) {
        const trainingDate = new Date(data.date);

        invalidateTrainingCalendarQueries(queryClient, tenantId, trainingDate);
      } else {
        // Otherwise do broader invalidation
        queryClient.invalidateQueries({
          queryKey: [queryKeys.training.all],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeys.training.grouped],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeys.training.byPattern],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeys.training.byDayRange(7)],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.training.allCalendarEvents(tenantId),
        });
      }
    },
  });
};
