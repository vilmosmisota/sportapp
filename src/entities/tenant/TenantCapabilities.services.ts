import { TypedClient } from "@/libs/supabase/type";
import { TenantCapabilities, TenantCapabilitiesSchema } from "./Tenant.schema";

export const getTenantCapabilities = async (
  client: TypedClient,
  tenantId: number
) => {
  const { data, error } = await client
    .from("tenantCapabilities")
    .select("*")
    .eq("tenantId", tenantId)
    .single();

  if (error) throw new Error(error.message);
  return TenantCapabilitiesSchema.parse(data);
};

export const updateTenantCapabilities = async (
  client: TypedClient,
  tenantId: number,
  capabilities: Partial<TenantCapabilities>
) => {
  const { data, error } = await client
    .from("tenantCapabilities")
    .update(capabilities)
    .eq("tenantId", tenantId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return TenantCapabilitiesSchema.parse(data);
};

export const createTenantCapabilities = async (
  client: TypedClient,
  capabilities: Omit<TenantCapabilities, "id">
) => {
  const { data, error } = await client
    .from("tenantCapabilities")
    .insert(capabilities)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return TenantCapabilitiesSchema.parse(data);
};
