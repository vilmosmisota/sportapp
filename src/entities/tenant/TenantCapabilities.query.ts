import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TenantFeatures } from "./Tenant.schema";
import {
  createTenantFeatures,
  getTenantFeatures,
  updateTenantFeatures,
} from "./TenantFeatures.services";

export const useTenantFeatures = (tenantId: number) => {
  const client = useSupabase();
  const queryKey = [queryKeys.tenant.capabilities(tenantId)];

  return useQuery({
    queryKey,
    queryFn: () => getTenantFeatures(client, tenantId),
    enabled: !!tenantId,
  });
};

export const useUpdateTenantFeatures = (tenantId: number) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (capabilities: Partial<TenantFeatures>) =>
      updateTenantFeatures(client, tenantId, capabilities),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.tenant.capabilities(tenantId)],
      });
    },
  });
};

export const useCreateTenantFeatures = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (capabilities: Omit<TenantFeatures, "id">) =>
      createTenantFeatures(client, capabilities),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.tenant.capabilities(data.tenantId!)],
      });
    },
  });
};
