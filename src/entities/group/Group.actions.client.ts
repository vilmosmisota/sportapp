import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Group } from "./Group.schema";
import { createGroup, deleteGroup, updateGroup } from "./Group.services";

export const useCreateGroup = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupData: Omit<Group, "id" | "tenantId">) =>
      createGroup(client, tenantId, groupData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.group.list(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.group.all,
      });
    },
  });
};

export const useUpdateGroup = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      groupData,
    }: {
      groupId: number;
      groupData: Partial<Omit<Group, "id" | "tenantId">>;
    }) => updateGroup(client, groupId, tenantId, groupData),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.group.list(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.group.detail(tenantId, groupId.toString()),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.group.all,
      });
    },
  });
};

export const useDeleteGroup = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: number) => deleteGroup(client, groupId, tenantId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.group.list(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.group.detail(tenantId, groupId.toString()),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.group.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byGroup(tenantId, groupId),
      });
    },
  });
};
