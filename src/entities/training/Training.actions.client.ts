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

export const useAddTraining = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TrainingForm) => addTraining(client, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.all, tenantId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.grouped, tenantId],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.training.allCalendarEvents(tenantId),
      });
    },
  });
};

export const useAddTrainingBatch = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      dates: string[];
      startTime: string;
      endTime: string;
      location: TrainingLocation;
      teamId: number | null;
      seasonId: number;
      meta?: Meta;
    }) => addTrainingBatch(client, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.all, tenantId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.grouped, tenantId],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.training.allCalendarEvents(tenantId),
      });
    },
  });
};

export const useUpdateTraining = (trainingId: number, tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TrainingForm) =>
      updateTraining(client, trainingId, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.all],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.grouped],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.detail(tenantId, trainingId.toString())],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.byDayRange(7)],
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
    },
  });
};

export const useDeleteTraining = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trainingId: number) =>
      deleteTraining(client, trainingId, tenantId),
    onSuccess: () => {
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
    },
  });
};

export const useUpdateTrainingPattern = () => {
  const queryClient = useQueryClient();
  const client = useSupabase();

  return useMutation({
    mutationFn: (params: UpdateTrainingPattern) =>
      updateTrainingPattern(client, params),
    onSuccess: (_, variables) => {
      const tenantId = variables.tenantId.toString();
      queryClient.invalidateQueries({ queryKey: [queryKeys.training.all] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.training.grouped] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.training.allCalendarEvents(tenantId),
      });
    },
  });
};

export const useDeleteTrainingPattern = () => {
  const queryClient = useQueryClient();
  const client = useSupabase();

  return useMutation({
    mutationFn: (params: DeleteTrainingPattern) =>
      deleteTrainingPattern(client, params),
    onSuccess: (_, variables) => {
      const tenantId = variables.tenantId.toString();
      queryClient.invalidateQueries({ queryKey: [queryKeys.training.all] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.training.grouped] });
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
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.all],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.grouped],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.detail(tenantId, trainingId.toString())],
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
    },
  });
};
