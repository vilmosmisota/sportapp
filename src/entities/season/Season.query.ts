import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { getSeasonsByTenantId } from "./Season.services";
import { useQuery } from "@tanstack/react-query";

export const useSeasonsByTenantId = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.season.all];
  const queryFn = async () => {
    const data = await getSeasonsByTenantId(tenantId, client);
    return data;
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!tenantId,
  });
};
