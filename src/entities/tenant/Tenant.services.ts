import { TypedClient } from "@/libs/supabase/type";
import { Tenant, TenantForm, TenantSchema } from "./Tenant.schema";

export const getTenantByDomain = async (
  domain: string,
  typedClient: TypedClient
): Promise<Tenant> => {
  const { data, error } = await typedClient
    .from("tenants")
    .select(
      `
      *,
      tenantConfigs (
        id,
        createdAt,
        updatedAt,
        general,
        performers,
        development
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
  id: string
) => {
  const { tenantConfig, ...tenantData } = data;

  // Update the tenant record
  const { data: tenant, error: tenantError } = await client
    .from("tenants")
    .update(tenantData)
    .eq("id", id)
    .select(
      `
      *,
      tenantConfigs (
        id,
        createdAt,
        updatedAt,
        general,
        performers,
        development
      )
    `
    )
    .single();

  console.log("tenant", tenant);

  if (tenantError) {
    throw new Error(tenantError.message);
  }

  if (tenantConfig && (tenant as any).tenantConfigId) {
    const { error: configError } = await client
      .from("tenantConfigs")
      .update({
        general: tenantConfig.general,
        performers: tenantConfig.performers,
        development: tenantConfig.development,
      })
      .eq("id", (tenant as any).tenantConfigId);

    if (configError) {
      throw new Error(configError.message);
    }

    // Fetch the updated tenant with config
    const { data: updatedTenant, error: fetchError } = await client
      .from("tenants")
      .select(
        `
        *,
        tenantConfigs (
          id,
          createdAt,
          updatedAt,
          general,
          performers,
          development
        )
      `
      )
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    return TenantSchema.parse(updatedTenant);
  }

  return TenantSchema.parse(tenant);
};

export const createTenant = async (
  client: TypedClient,
  data: TenantForm
): Promise<Tenant> => {
  const { tenantConfig, ...tenantData } = data;

  // First create the tenant config
  const { data: config, error: configError } = await client
    .from("tenantConfigs")
    .insert({
      general: tenantConfig?.general,
      performers: tenantConfig?.performers,
      development: tenantConfig?.development,
    })
    .select()
    .single();

  if (configError) {
    throw new Error(configError.message);
  }

  const { data: tenant, error: tenantError } = await client
    .from("tenants")
    .insert({
      ...tenantData,
      tenantConfigId: config.id,
    })
    .select(
      `
      *,
      tenantConfigs (
        id,
        createdAt,
        updatedAt,
        general,
        performers,
        development
      )
    `
    )
    .single();

  if (tenantError) {
    throw new Error(tenantError.message);
  }

  return TenantSchema.parse(tenant);
};
