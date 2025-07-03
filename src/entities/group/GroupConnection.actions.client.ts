"use client";

import { queryKeys } from "@/cacheKeys/cacheKeys";
import { getBrowserClient } from "@/libs/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AssignMembersToGroupDiff,
  GroupMemberAssignmentResult,
} from "./GroupConnection.schema";
import { assignMembersToGroup } from "./GroupConnection.service";

/**
 * Hook to assign members to a group with cache invalidation
 */
export function useAssignMembersToGroup(tenantId: string) {
  const queryClient = useQueryClient();
  const supabase = getBrowserClient();

  return useMutation<
    GroupMemberAssignmentResult,
    Error,
    AssignMembersToGroupDiff
  >({
    mutationFn: async (changes: AssignMembersToGroupDiff) => {
      return await assignMembersToGroup(supabase, changes);
    },
    onSuccess: (data, variables) => {
      const { groupId } = variables;

      // Invalidate group-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.group.connections(tenantId, groupId.toString()),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.group.detail(tenantId, groupId.toString()),
      });

      // Invalidate group list to update member counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.group.list(tenantId),
      });

      // Invalidate member queries that might be affected
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byGroup(tenantId, groupId),
      });

      // Invalidate member queries by type (performers and managers)
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byType(tenantId, "performer"),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byType(tenantId, "manager"),
      });

      // If we have specific member IDs that were affected, invalidate their details
      const affectedMemberIds = [
        ...variables.toAdd.map((a) => a.memberId),
        ...variables.toRemove,
        ...variables.toUpdate.map((u) => u.memberId),
      ];

      affectedMemberIds.forEach((memberId) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.member.detail(tenantId, memberId.toString()),
        });
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.managementDashboard.byTenant(tenantId),
      });
    },
    onError: (error) => {
      console.error("Error assigning members to group:", error);
    },
  });
}
