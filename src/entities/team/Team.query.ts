import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { getTeamsByTenantId } from "./Team.services";
import { useQuery } from "@tanstack/react-query";

export const useGetTeamsByTenantId = (tenantId: string) => {
  const client = useSupabase();

  const queryKey = [queryKeys.team.all];
  const queryFn = async () => {
    const data = await getTeamsByTenantId(client, tenantId);
    return data;
  };

  return useQuery({ queryKey, queryFn, enabled: !!tenantId });
};
