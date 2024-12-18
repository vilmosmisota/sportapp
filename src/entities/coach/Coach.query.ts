import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { getCoachesByTenantId } from "./Coach.services";
import { useQuery } from "@tanstack/react-query";

export const useCoaches = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.coach.all];

  const queryFn = async () => {
    const data = await getCoachesByTenantId(client, tenantId);
    return data;
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!tenantId,
  });
};
