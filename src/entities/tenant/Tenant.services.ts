import { TypedClient } from "@/libs/supabase/type";
import {
  Tenant,
  TenantDevelopmentConfig,
  TenantForm,
  TenantGeneralConfig,
  TenantGroupsConfig,
  TenantPerformersConfig,
  TenantSchema,
} from "./Tenant.schema";

export const getTenantByDomain = async (
  domain: string,
  typedClient: TypedClient
): Promise<Tenant> => {
  const { data, error } = await typedClient
    .from("tenants")
    .select(
      `
      *,
      tenantConfigs!tenants_tenantConfigId_fkey (
        id,
        createdAt,
        updatedAt,
        general,
        performers,
        development,
        groups,
        competition
      )
    `
    )
    .eq("domain", `${domain}`)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return TenantSchema.parse(data);
};

export const updateTenant = async (
  client: TypedClient,
  data: TenantForm,
  id: string,
  configId?: number
) => {
  const { tenantConfig, ...tenantData } = data;

  const { error: tenantError } = await client
    .from("tenants")
    .update(tenantData)
    .eq("id", id)
    .select(
      `
      id
    `
    )
    .single();

  if (tenantError) {
    throw new Error(tenantError.message);
  }

  if (tenantConfig) {
    if (configId) {
      const { error: configError } = await client
        .from("tenantConfigs")
        .update({
          general: tenantConfig.general,
          performers: tenantConfig.performers,
          development: tenantConfig.development,
          groups: tenantConfig.groups,
        })
        .eq("id", configId);

      if (configError) {
        throw new Error(configError.message);
      }
    } else {
      const { data: newConfig, error: configError } = await client
        .from("tenantConfigs")
        .insert({
          general: tenantConfig.general,
          performers: tenantConfig.performers,
          development: tenantConfig.development,
          groups: tenantConfig.groups,
        })
        .select("id")
        .single();

      if (configError) {
        throw new Error(configError.message);
      }

      const { error: linkError } = await client
        .from("tenants")
        .update({ tenantConfigId: newConfig.id } as any)
        .eq("id", id);

      if (linkError) {
        throw new Error(linkError.message);
      }
    }
  }

  return true;
};

export const createTenant = async (
  client: TypedClient,
  data: TenantForm
): Promise<boolean> => {
  const { tenantConfig, ...tenantData } = data;

  const { data: newConfig, error: configError } = await client
    .from("tenantConfigs")
    .insert({
      general: tenantConfig?.general,
      performers: tenantConfig?.performers,
      development: tenantConfig?.development,
      groups: tenantConfig?.groups,
    })
    .select("id")
    .single();

  if (configError) {
    throw new Error(configError.message);
  }

  const { data: newTenant, error: newTenantError } = await client
    .from("tenants")
    .insert({
      ...tenantData,
      tenantConfigId: newConfig.id,
    })
    .select("id")
    .single();

  if (newTenantError) {
    throw new Error(newTenantError.message);
  }

  return true;
};

export const updateTenantConfig = async (
  client: TypedClient,
  tenantId: string,
  configUpdates: Partial<{
    general: TenantGeneralConfig;
    performers: TenantPerformersConfig;
    development: TenantDevelopmentConfig;
    groups: TenantGroupsConfig;
  }>,
  configId?: number
): Promise<boolean> => {
  if (configId) {
    const { error: configError } = await client
      .from("tenantConfigs")
      .update(configUpdates)
      .eq("id", configId);

    if (configError) {
      throw new Error(configError.message);
    }
  } else {
    const { data: newConfig, error: configError } = await client
      .from("tenantConfigs")
      .insert(configUpdates)
      .select("id")
      .single();

    if (configError) {
      throw new Error(configError.message);
    }

    const { error: tenantError } = await client
      .from("tenants")
      .update({ tenantConfigId: newConfig.id } as any)
      .eq("id", tenantId);

    if (tenantError) {
      throw new Error(tenantError.message);
    }
  }

  return true;
};

export const updateTenantGroupsConfig = async (
  client: TypedClient,
  tenantId: string,
  groupsConfig: TenantGroupsConfig,
  configId?: number
): Promise<boolean> => {
  return updateTenantConfig(
    client,
    tenantId,
    { groups: groupsConfig },
    configId
  );
};
