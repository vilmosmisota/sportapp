import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addGuardian,
  AddGuardianOptions,
  deleteGuardian,
  updateGuardian,
  UpdateGuardianOptions,
  updateGuardianPerformerConnections,
  UpdateGuardianPerformerConnectionsOptions,
} from "./Guardian.services";

export const useAddGuardian = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options: AddGuardianOptions) =>
      addGuardian(client, tenantId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byType(tenantId, "guardian"),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
    },
  });
};

export const useUpdateGuardian = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      guardianId,
      options,
    }: {
      guardianId: number;
      options: UpdateGuardianOptions;
    }) => updateGuardian(client, guardianId, tenantId, options),
    onSuccess: (_, { guardianId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byType(tenantId, "guardian"),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.detail(tenantId, guardianId.toString()),
      });
    },
  });
};

export const useDeleteGuardian = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guardianId: number) =>
      deleteGuardian(client, guardianId, tenantId),
    onSuccess: (_, guardianId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byType(tenantId, "guardian"),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.familyConnections(tenantId),
      });
    },
  });
};

export const useUpdateGuardianPerformerConnections = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      guardianId,
      options,
    }: {
      guardianId: number;
      options: UpdateGuardianPerformerConnectionsOptions;
    }) => updateGuardianPerformerConnections(client, guardianId, options),
    onSuccess: (_, { guardianId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.familyConnections(tenantId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byType(tenantId, "guardian"),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byType(tenantId, "performer"),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.detail(tenantId, guardianId.toString()),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.all,
      });
    },
  });
};
