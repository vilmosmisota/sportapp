import { queryKeys } from "../../cacheKeys/cacheKeys";

import { useQueryClient } from "@tanstack/react-query";
import {
  addPerformer,
  deletePerformer,
  updateMemberTenantUserId,
  UpdateMemberTenantUserIdOptions,
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
    mutationFn: (options: UpdateMemberTenantUserIdOptions) =>
      updateMemberTenantUserId(client, tenantId, options),
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.familyConnections(tenantId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byType(tenantId, "performer"),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.detail(tenantId, memberId.toString()),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.user.list(tenantId),
      });
    },
  });
};
