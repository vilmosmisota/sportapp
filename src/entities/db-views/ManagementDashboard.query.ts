import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { getManagementDashboard } from "./ManagementDashboard.services";

export const useManagementDashboard = (tenantId: string) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.managementDashboard.byTenant(tenantId),
    queryFn: () => getManagementDashboard(client, tenantId),
    enabled: !!tenantId,
  });
};
