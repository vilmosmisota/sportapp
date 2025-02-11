import { TypedClient } from "@/libs/supabase/type";
import { TenantForm, TenantInfoSchema, TenantSchema } from "./Tenant.schema";

export const getTenantByDomain = async (
  domain: string,
  typedClient: TypedClient
) => {
  const { data, error } = await typedClient
    .from("tenants")
    .select("*")
    .eq("domain", `${domain}`)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  const validatedData = TenantSchema.parse(data);

  return validatedData;
};

export const getTenantInfoByDomain = async (
  domain: string,
  typedClient: TypedClient
) => {
  const { data, error } = await typedClient
    .from("tenants")
    .select("type, id, isPublicSitePublished")
    .eq("domain", `${domain}`)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const validatedData = TenantInfoSchema.parse(data);

  return {
    tenantType: validatedData.type,
    tenantId: validatedData.id,
    isPublicSitePublished: validatedData.isPublicSitePublished,
  };
};

export const updateTenant = async (
  client: TypedClient,
  data: TenantForm,
  id: string
) => {
  const { data: tenant, error } = await client
    .from("tenants")
    .update(data)
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return tenant;
};
