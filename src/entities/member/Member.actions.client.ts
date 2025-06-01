import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MemberForm } from "./Member.schema";
import {
  addMemberToTenant,
  addPerformer,
  AddPerformerOptions,
  assignMultiplePerformersToParent,
  assignPerformerToMultipleParents,
  assignPerformerToParent,
  deleteMember,
  removePerformerFromParent,
  updateMember,
} from "./Member.services";

export const useAddMember = (tenantId: string) => {
  const queryClient = useQueryClient();
  const client = useSupabase();

  return useMutation({
    mutationFn: async ({ memberData }: { memberData: MemberForm }) => {
      return addMemberToTenant(client, memberData, tenantId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.member.all });

      if (data.memberType) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.member.byType(tenantId, data.memberType),
        });
      }

      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "member" &&
          query.queryKey[1] === "byGroup" &&
          query.queryKey[2] === tenantId,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

/**
 * Comprehensive hook to add a performer with all related connections
 * Handles member creation, parent connections, group connections, and user assignment atomically
 */
export const useAddPerformer = (tenantId: string) => {
  const queryClient = useQueryClient();
  const client = useSupabase();

  return useMutation({
    mutationFn: async (options: AddPerformerOptions) => {
      return addPerformer(client, tenantId, options);
    },
    onSuccess: (data) => {
      // Invalidate member lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.member.all });

      // Invalidate member type queries
      if (data.memberType) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.member.byType(tenantId, data.memberType),
        });
      }

      // Invalidate group-related queries
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "member" &&
          query.queryKey[1] === "byGroup" &&
          query.queryKey[2] === tenantId,
      });

      // Invalidate family connection queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.familyConnections(tenantId),
      });

      // Invalidate parent-performer relationship queries
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "member" &&
          (query.queryKey[1] === "parentPerformers" ||
            query.queryKey[1] === "performerParents") &&
          query.queryKey[2] === tenantId,
      });

      toast.success("Performer added successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateMember = (memberId: number, tenantId: string) => {
  const queryClient = useQueryClient();
  const client = useSupabase();

  return useMutation({
    mutationFn: async ({ memberData }: { memberData: MemberForm }) => {
      return updateMember(client, memberData, memberId, tenantId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.member.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.detail(tenantId, memberId.toString()),
      });

      if (data.memberType) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.member.byType(tenantId, data.memberType),
        });
      }

      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "member" &&
          query.queryKey[1] === "byGroup" &&
          query.queryKey[2] === tenantId,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteMember = (tenantId: string) => {
  const queryClient = useQueryClient();
  const client = useSupabase();

  return useMutation({
    mutationFn: async (memberId: number) => {
      return deleteMember(client, memberId, tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.member.all });

      // Invalidate all byType queries for this tenant
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "member" &&
          query.queryKey[1] === "byType" &&
          query.queryKey[2] === tenantId,
      });

      // Invalidate all byGroup queries for this tenant
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "member" &&
          query.queryKey[1] === "byGroup" &&
          query.queryKey[2] === tenantId,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.familyConnections(tenantId),
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useAssignPerformerToParent = (tenantId: string) => {
  const queryClient = useQueryClient();
  const client = useSupabase();

  return useMutation({
    mutationFn: async ({
      parentId,
      performerId,
    }: {
      parentId: number;
      performerId: number;
    }) => {
      return assignPerformerToParent(client, parentId, performerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.familyConnections(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
      // Invalidate all parentPerformers queries for this tenant
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "member" &&
          query.queryKey[1] === "parentPerformers" &&
          query.queryKey[2] === tenantId,
      });
      // Invalidate all performerParents queries for this tenant
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "member" &&
          query.queryKey[1] === "performerParents" &&
          query.queryKey[2] === tenantId,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useRemovePerformerFromParent = (tenantId: string) => {
  const queryClient = useQueryClient();
  const client = useSupabase();

  return useMutation({
    mutationFn: async ({
      parentId,
      performerId,
    }: {
      parentId: number;
      performerId: number;
    }) => {
      return removePerformerFromParent(client, parentId, performerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.familyConnections(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
      // Invalidate all parentPerformers queries for this tenant
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "member" &&
          query.queryKey[1] === "parentPerformers" &&
          query.queryKey[2] === tenantId,
      });
      // Invalidate all performerParents queries for this tenant
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "member" &&
          query.queryKey[1] === "performerParents" &&
          query.queryKey[2] === tenantId,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useAssignMultiplePerformersToParent = (tenantId: string) => {
  const queryClient = useQueryClient();
  const client = useSupabase();

  return useMutation({
    mutationFn: async ({
      parentId,
      performerIds,
    }: {
      parentId: number;
      performerIds: number[];
    }) => {
      return assignMultiplePerformersToParent(client, parentId, performerIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.familyConnections(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
      // Invalidate all parentPerformers queries for this tenant
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "member" &&
          query.queryKey[1] === "parentPerformers" &&
          query.queryKey[2] === tenantId,
      });
      // Invalidate all performerParents queries for this tenant
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "member" &&
          query.queryKey[1] === "performerParents" &&
          query.queryKey[2] === tenantId,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useAssignPerformerToMultipleParents = (tenantId: string) => {
  const queryClient = useQueryClient();
  const client = useSupabase();

  return useMutation({
    mutationFn: async ({
      performerId,
      parentIds,
    }: {
      performerId: number;
      parentIds: number[];
    }) => {
      return assignPerformerToMultipleParents(client, performerId, parentIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.familyConnections(tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
      // Invalidate all parentPerformers queries for this tenant
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "member" &&
          query.queryKey[1] === "parentPerformers" &&
          query.queryKey[2] === tenantId,
      });
      // Invalidate all performerParents queries for this tenant
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "member" &&
          query.queryKey[1] === "performerParents" &&
          query.queryKey[2] === tenantId,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
