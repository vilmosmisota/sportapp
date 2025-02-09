import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TenantCapabilities } from "./Tenant.schema";
import {
  createTenantCapabilities,
  getTenantCapabilities,
  updateTenantCapabilities,
} from "./TenantCapabilities.services";

export const useTenantCapabilities = (tenantId: number) => {
  const client = useSupabase();
  const queryKey = [queryKeys.tenant.capabilities(tenantId)];

  return useQuery({
    queryKey,
    queryFn: () => getTenantCapabilities(client, tenantId),
    enabled: !!tenantId,
  });
};

export const useUpdateTenantCapabilities = (tenantId: number) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (capabilities: Partial<TenantCapabilities>) =>
      updateTenantCapabilities(client, tenantId, capabilities),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.tenant.capabilities(tenantId)],
      });
    },
  });
};

export const useCreateTenantCapabilities = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (capabilities: Omit<TenantCapabilities, "id">) =>
      createTenantCapabilities(client, capabilities),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.tenant.capabilities(data.tenantId!)],
      });
    },
  });
};
