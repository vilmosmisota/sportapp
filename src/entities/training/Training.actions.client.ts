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
    }) => addTrainingBatch(client, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.all, tenantId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.training.grouped, tenantId],
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.training.all] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.training.grouped] });
    },
  });
};

export const useDeleteTrainingPattern = () => {
  const queryClient = useQueryClient();
  const client = useSupabase();

  return useMutation({
    mutationFn: (params: DeleteTrainingPattern) =>
      deleteTrainingPattern(client, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.training.all] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.training.grouped] });
    },
  });
};
