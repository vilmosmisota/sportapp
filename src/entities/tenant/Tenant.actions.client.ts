import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TenantForm } from "./Tenant.schema";
import { updateTenant } from "./Tenant.services";
import { queryKeys } from "@/cacheKeys/cacheKeys";

export const useUpdateTenant = (tenantId: string, tenantDomain: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [
    queryKeys.tenant.all,
    queryKeys.tenant.detail(tenantDomain),
  ];

  return useMutation({
    mutationFn: (data: TenantForm) => updateTenant(client, data, tenantId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
