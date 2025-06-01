import { TypedClient } from "@/libs/supabase/type";
import {
  CreateCustomField,
  CustomField,
  CustomFieldSchema,
  UpdateCustomField,
} from "./CustomFieldSchema";

const CUSTOM_FIELD_QUERY = `*`;

export const getCustomFieldsByTenantAndEntity = async (
  client: TypedClient,
  tenantId: number,
  entityType: string
): Promise<CustomField[]> => {
  const { data, error } = await client
    .from("customfields")
    .select(CUSTOM_FIELD_QUERY)
    .eq("tenantId", tenantId)
    .eq("entityType", entityType)
    .order("order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((field) => CustomFieldSchema.parse(field));
};

export const getCustomFieldById = async (
  client: TypedClient,
  fieldId: number,
  tenantId: number
): Promise<CustomField> => {
  const { data, error } = await client
    .from("customfields")
    .select(CUSTOM_FIELD_QUERY)
    .eq("id", fieldId)
    .eq("tenantId", tenantId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return CustomFieldSchema.parse(data);
};

export const createCustomField = async (
  client: TypedClient,
  data: CreateCustomField,
  tenantId: number
): Promise<CustomField> => {
  const { data: field, error } = await client
    .from("customfields")
    .insert({
      ...data,
      tenantId,
    })
    .select(CUSTOM_FIELD_QUERY)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return CustomFieldSchema.parse(field);
};

export const updateCustomField = async (
  client: TypedClient,
  fieldId: number,
  data: UpdateCustomField,
  tenantId: number
): Promise<CustomField> => {
  const { data: field, error } = await client
    .from("customfields")
    .update(data)
    .eq("id", fieldId)
    .eq("tenantId", tenantId)
    .select(CUSTOM_FIELD_QUERY)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return CustomFieldSchema.parse(field);
};

export const deleteCustomField = async (
  client: TypedClient,
  fieldId: number,
  tenantId: number
): Promise<void> => {
  const { error } = await client
    .from("customfields")
    .delete()
    .eq("id", fieldId)
    .eq("tenantId", tenantId);

  if (error) {
    throw new Error(error.message);
  }
};
