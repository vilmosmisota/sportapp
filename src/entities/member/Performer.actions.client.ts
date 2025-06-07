import { queryKeys } from "../../cacheKeys/cacheKeys";

import { useQueryClient } from "@tanstack/react-query";
import {
  addPerformer,
  deletePerformer,
  updateMemberTenantUserId,
  updatePerformer,
  UpdatePerformerOptions,
} from "./Performer.services";

import { useSupabase } from "../../libs/supabase/useSupabase";

import { useMutation } from "@tanstack/react-query";
import { AddPerformerOptions } from "./Performer.services";

// TODO: when groups are ready we need to invalidate the group related queries

export const useAddPerformer = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options: AddPerformerOptions) =>
      addPerformer(client, tenantId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byType(tenantId, "performer"),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
    },
  });
};

export const useUpdatePerformer = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      performerId,
      options,
    }: {
      performerId: number;
      options: UpdatePerformerOptions;
    }) => updatePerformer(client, performerId, tenantId, options),
    onSuccess: (_, { performerId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byType(tenantId, "performer"),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
    },
  });
};

export const useDeletePerformer = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (performerId: number) =>
      deletePerformer(client, performerId, tenantId),
    onSuccess: (_, performerId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byType(tenantId, "performer"),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
    },
  });
};

export const useUpdateMemberTenantUserId = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      tenantUserId,
    }: {
      memberId: number;
      tenantUserId: number | null;
    }) => updateMemberTenantUserId(client, memberId, tenantId, tenantUserId),
    onSuccess: () => {
      // Invalidate all member-related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.familyConnections(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byType(tenantId, "performer"),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byType(tenantId, "parent"),
      });
    },
  });
};
