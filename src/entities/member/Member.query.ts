import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import {
  getFamilyMemberConnections,
  getMembersByGroupId,
  getMembersByTenantId,
  getMembersByType,
  getParentsByPerformerId,
  getPerformersByParentId,
} from "./Member.services";

export const useMembers = (tenantId: string) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.member.list(tenantId),
    queryFn: () => getMembersByTenantId(client, tenantId),
    enabled: !!tenantId,
  });
};

export const useMembersByType = (tenantId: string, memberType: string) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.member.byType(tenantId, memberType),
    queryFn: () => getMembersByType(client, tenantId, memberType),
    enabled: !!tenantId && !!memberType,
  });
};

export const useMembersByGroupId = (tenantId: string, groupId: number) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.member.byGroup(tenantId, groupId),
    queryFn: () => getMembersByGroupId(client, groupId, tenantId),
    enabled: !!tenantId && !!groupId,
  });
};

export const usePerformers = (tenantId: string) => {
  return useMembersByType(tenantId, "performer");
};

export const useParents = (tenantId: string) => {
  return useMembersByType(tenantId, "parent");
};

export const useManagers = (tenantId: string) => {
  return useMembersByType(tenantId, "manager");
};

// Family Member Connection Queries

export const useFamilyMemberConnections = (tenantId: string) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.member.familyConnections(tenantId),
    queryFn: () => getFamilyMemberConnections(client, tenantId),
    enabled: !!tenantId,
  });
};

export const usePerformersByParentId = (parentId: number, tenantId: string) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.member.parentPerformers(tenantId, parentId),
    queryFn: () => getPerformersByParentId(client, parentId, tenantId),
    enabled: !!parentId && !!tenantId,
  });
};

export const useParentsByPerformerId = (
  performerId: number,
  tenantId: string
) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.member.performerParents(tenantId, performerId),
    queryFn: () => getParentsByPerformerId(client, performerId, tenantId),
    enabled: !!performerId && !!tenantId,
  });
};
