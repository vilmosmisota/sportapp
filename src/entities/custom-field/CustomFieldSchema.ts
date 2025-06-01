import { z } from "zod";
import { AppearanceSchema } from "../shared/Appearance.schema";

export enum FieldType {
  Text = "text",
  Number = "number",
  Date = "date",
  Boolean = "boolean",
  Select = "select",
}

export enum ValueType {
  Text = "text",
  Number = "number",
  Boolean = "boolean",
  Date = "date",
  Json = "json",
}

export enum DisplayType {
  Tag = "tag",
  String = "string",
}

export const CustomFieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const CustomFieldConfigSchema = z.object({
  displayType: z.nativeEnum(DisplayType),
  appearance: AppearanceSchema.optional(),
});

export const CustomFieldSchema = z.object({
  id: z.number(),
  tenantId: z.number(),
  entityType: z.string(),
  name: z.string(),
  label: z.string(),
  type: z.nativeEnum(FieldType),
  required: z.boolean().default(false),
  options: z.array(CustomFieldOptionSchema).default([]),
  order: z.number().default(0),
  isSearchable: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  config: CustomFieldConfigSchema.default({
    displayType: DisplayType.String,
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CustomFieldValueSchema = z.object({
  id: z.number(),
  fieldId: z.number(),
  entityId: z.number(),
  value: z.string().nullable(),
  valueType: z.nativeEnum(ValueType),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// For creating a new custom field
export const CreateCustomFieldSchema = CustomFieldSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// For updating an existing custom field
export const UpdateCustomFieldSchema = CreateCustomFieldSchema.partial();

// For creating/updating a custom field value
export const UpsertCustomFieldValueSchema = CustomFieldValueSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type CustomField = z.infer<typeof CustomFieldSchema>;
export type CustomFieldValue = z.infer<typeof CustomFieldValueSchema>;
export type CustomFieldOption = z.infer<typeof CustomFieldOptionSchema>;
export type CustomFieldConfig = z.infer<typeof CustomFieldConfigSchema>;
export type CreateCustomField = z.infer<typeof CreateCustomFieldSchema>;
export type UpdateCustomField = z.infer<typeof UpdateCustomFieldSchema>;
export type UpsertCustomFieldValue = z.infer<
  typeof UpsertCustomFieldValueSchema
>;
