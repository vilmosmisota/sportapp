import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { getGroups } from "./Group.services";

export const useGroups = (tenantId: string) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.group.list(tenantId),
    queryFn: () => getGroups(client, tenantId),
    enabled: !!tenantId,
  });
};
