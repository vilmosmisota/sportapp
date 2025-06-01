import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { getPerformers } from "./Performer.services";

export const usePerformers = (tenantId: string) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.member.byType(tenantId, "performer"),
    queryFn: () => getPerformers(client, tenantId),
    enabled: !!tenantId,
  });
};
