import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TenantDevelopmentConfig,
  TenantForm,
  TenantGeneralConfig,
  TenantGroupsConfig,
  TenantPerformersConfig,
} from "./Tenant.schema";
import {
  createTenant,
  updateTenant,
  updateTenantConfig,
  updateTenantGroupsConfig,
} from "./Tenant.services";

export const useUpdateTenant = (
  tenantId: string,
  tenantDomain: string,
  configId?: number
) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [
    queryKeys.tenant.all,
    queryKeys.tenant.detail(tenantDomain),
  ];

  return useMutation({
    mutationFn: (data: TenantForm) =>
      updateTenant(client, data, tenantId, configId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useCreateTenant = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TenantForm) => createTenant(client, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.tenant.all] });
    },
  });
};

export const useUpdateTenantConfig = (
  tenantId: string,
  tenantDomain: string,
  configId?: number
) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [
    queryKeys.tenant.all,
    queryKeys.tenant.detail(tenantDomain),
  ];

  return useMutation({
    mutationFn: (
      configUpdates: Partial<{
        general: TenantGeneralConfig;
        performers: TenantPerformersConfig;
        development: TenantDevelopmentConfig;
        groups: TenantGroupsConfig;
      }>
    ) => updateTenantConfig(client, tenantId, configUpdates, configId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useUpdateTenantGroupsConfig = (
  tenantId: string,
  tenantDomain: string,
  configId?: number
) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [
    queryKeys.tenant.all,
    queryKeys.tenant.detail(tenantDomain),
  ];

  return useMutation({
    mutationFn: (groupsConfig: TenantGroupsConfig) =>
      updateTenantGroupsConfig(client, tenantId, groupsConfig, configId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
