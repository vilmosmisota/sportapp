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
