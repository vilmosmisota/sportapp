import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TrainingForm } from "./Training.schema";
import {
  addTraining,
  updateTraining,
  deleteTraining,
  addTrainingBatch,
} from "./Training.services";
import { TrainingLocation } from "@/entities/tenant/Tenant.schema";

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
