import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { getPerformersWithConnections } from "./PerformerConnection.service";

export const usePerformersWithConnections = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = queryKeys.member.familyConnections(tenantId);

  return useQuery({
    queryKey,
    queryFn: () => getPerformersWithConnections(client, tenantId),
    enabled: !!tenantId,
  });
};
