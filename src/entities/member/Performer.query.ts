import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { getMembersByType, getPerformers } from "./Performer.services";

export const usePerformers = (tenantId: string) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.member.byType(tenantId, "performer"),
    queryFn: () => getPerformers(client, tenantId),
    enabled: !!tenantId,
  });
};

export const useParentMembers = (tenantId: string) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.member.byType(tenantId, "parent"),
    queryFn: () => getMembersByType(client, tenantId, "parent"),
    enabled: !!tenantId,
  });
};
