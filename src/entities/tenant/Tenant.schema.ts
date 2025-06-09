import { z } from "zod";
import { DisplaySlugSchema } from "../shared/DisplaySlug.schema";
import { LocationSchema } from "../shared/Location.schema";

export enum AgeDisplay {
  RANGE = "range",
  PREFIX = "prefix",
}

export enum Sport {
  FOOTBALL = "Football",
  BASKETBALL = "Basketball",
  SOCCER = "Soccer",
  TENNIS = "Tennis",
  BASEBALL = "Baseball",
  VOLLEYBALL = "Volleyball",
  RUGBY = "Rugby",
  HOCKEY = "Hockey",
  CRICKET = "Cricket",
  SWIMMING = "Swimming",
  ATHLETICS = "Athletics",
  OTHER = "Other",
}

export const TenantGeneralConfigSchema = z.object({
  sport: z.nativeEnum(Sport).optional(),
  logo: z.string().url("Must be a valid URL").optional(),
  description: z.string().optional(),
  location: LocationSchema.optional(),
});

export const TenantDevelopmentConfigSchema = z.object({
  lateThreshold: z.number().default(5),
  trainingLocations: z.array(LocationSchema).optional(),
});

export const TenantPerformersConfigSchema = z
  .object({})
  .merge(DisplaySlugSchema)
  .transform((data) => ({
    ...data,
    displayName: data.displayName ?? "performers",
    slug: data.slug ?? "performers",
  }));

export const TenantEmailConfigSchema = z.object({
  senderEmail: z.string().email().optional(),
  senderName: z.string().optional(),
  replyToEmail: z.string().email().optional(),
  enableTransactional: z.boolean().default(true),
  enableMarketing: z.boolean().default(false),
  customDomain: z.string().optional(),
});

export const TenantGroupsConfigSchema = z
  .object({
    useCustomName: z.boolean().default(false),
    displayFields: z
      .array(z.string())
      .min(1, "At least one display field is required")
      .max(3, "Maximum 3 display fields allowed")
      .default(["ageRange"]),
    displaySeparator: z.string().min(1, "Separator is required").default("•"),
    levelOptions: z.array(z.string()).default([]),
  })
  .default({
    useCustomName: false,
    displayFields: ["ageRange"],
    displaySeparator: "•",
    levelOptions: [],
  });

export enum TenantType {
  ORGANIZATION = "organization",
  LEAGUE = "league",
}

export const TenantConfigSchema = z.object({
  id: z.number(),
  createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  updatedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  general: TenantGeneralConfigSchema.nullable().optional(),
  development: TenantDevelopmentConfigSchema.nullable().optional(),
  performers: TenantPerformersConfigSchema.nullable().optional(),
  groups: TenantGroupsConfigSchema.nullable().optional(),
  competition: z.any().nullable().optional(), // Adding competition field from DB
});

export const TenantSchema = z.object({
  id: z.number(),
  createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  name: z.string(),
  type: z.nativeEnum(TenantType),
  domain: z.string(),
  tenantConfigId: z.number().nullable(),
  tenantConfigs: TenantConfigSchema.optional(),
});

// Form schema for creating/updating tenants
export const TenantFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(TenantType),
  domain: z.string().min(1, "Domain is required"),
  tenantConfig: z
    .object({
      general: TenantGeneralConfigSchema.optional(),
      development: TenantDevelopmentConfigSchema.optional(),
      performers: TenantPerformersConfigSchema.optional(),
      groups: TenantGroupsConfigSchema.optional(),
      competition: z.any().optional(),
    })
    .optional(),
});

// Types
export type Tenant = z.infer<typeof TenantSchema>;
export type TenantConfig = z.infer<typeof TenantConfigSchema>;
export type TenantForm = z.infer<typeof TenantFormSchema>;
export type TenantGeneralConfig = z.infer<typeof TenantGeneralConfigSchema>;
export type TenantDevelopmentConfig = z.infer<
  typeof TenantDevelopmentConfigSchema
>;
export type TenantPerformersConfig = z.infer<
  typeof TenantPerformersConfigSchema
>;
export type TenantEmailConfig = z.infer<typeof TenantEmailConfigSchema>;
export type TenantGroupsConfig = z.infer<typeof TenantGroupsConfigSchema>;
