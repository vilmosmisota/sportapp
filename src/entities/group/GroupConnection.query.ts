import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { getGroupConnections } from "./GroupConnection.service";

export const useGroupConnections = (
  tenantId: string,
  groupId: number,
  enabled = true
) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.group.connections(tenantId, groupId.toString()),
    queryFn: () => getGroupConnections(client, groupId, tenantId),
    enabled: enabled && !!tenantId && !!groupId,
  });
};

/**
 * Hook to get performers by group ID
 * Returns only the performer connections for a group
 */
export const usePerformersByGroupId = (
  tenantId: string,
  groupId: number,
  enabled = true
) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.member.byGroup(tenantId, groupId),
    queryFn: async () => {
      if (!tenantId || !groupId) return [];

      const groupData = await getGroupConnections(client, groupId, tenantId);
      // Return only the performer connections (not instructors)
      return groupData.memberConnections.performers;
    },
    enabled: enabled && !!tenantId && !!groupId,
  });
};
