import { TypedClient } from "@/libs/supabase/type";
import { TenantFeatures, TenantFeaturesSchema } from "./Tenant.schema";

export const getTenantFeatures = async (
  client: TypedClient,
  tenantId: number
) => {
  const { data, error } = await client
    .from("tenantFeatures")
    .select("*")
    .eq("tenantId", tenantId)
    .single();

  if (error) throw new Error(error.message);
  return TenantFeaturesSchema.parse(data);
};

export const updateTenantFeatures = async (
  client: TypedClient,
  tenantId: number,
  capabilities: Partial<TenantFeatures>
) => {
  const { data, error } = await client
    .from("tenantFeatures")
    .update(capabilities)
    .eq("tenantId", tenantId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return TenantFeaturesSchema.parse(data);
};

export const createTenantFeatures = async (
  client: TypedClient,
  capabilities: Omit<TenantFeatures, "id">
) => {
  const { data, error } = await client
    .from("tenantFeatures")
    .insert(capabilities)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return TenantFeaturesSchema.parse(data);
};
