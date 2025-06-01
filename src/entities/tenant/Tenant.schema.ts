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

export const TenantGroupsConfigSchema = z
  .object({
    customAgeCategories: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          sortOrder: z.number().default(0),
        })
      )
      .optional(),
  })
  .merge(DisplaySlugSchema)
  .transform((data) => ({
    ...data,
    displayName: data.displayName ?? "groups",
    slug: data.slug ?? "groups",
  }));

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

export enum TenantType {
  ORGANIZATION = "organization",
  LEAGUE = "league",
}

// Schema for the tenantConfigs table
export const TenantConfigSchema = z.object({
  id: z.number(),
  createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  updatedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  general: TenantGeneralConfigSchema.nullable().optional(),
  groups: TenantGroupsConfigSchema.nullable().optional(),
  development: TenantDevelopmentConfigSchema.nullable().optional(),
  performers: TenantPerformersConfigSchema.nullable().optional(),
});

export const TenantSchema = z.object({
  id: z.number(),
  createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  name: z.string(),
  type: z.nativeEnum(TenantType),
  domain: z.string(),
  tenantConfigId: z.number(),
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
      groups: TenantGroupsConfigSchema.optional(),
      development: TenantDevelopmentConfigSchema.optional(),
      performers: TenantPerformersConfigSchema.optional(),
    })
    .optional(),
});

// Types
export type Tenant = z.infer<typeof TenantSchema>;
export type TenantConfig = z.infer<typeof TenantConfigSchema>;
export type TenantForm = z.infer<typeof TenantFormSchema>;
export type TenantGeneralConfig = z.infer<typeof TenantGeneralConfigSchema>;
export type TenantGroupsConfig = z.infer<typeof TenantGroupsConfigSchema>;
export type TenantDevelopmentConfig = z.infer<
  typeof TenantDevelopmentConfigSchema
>;
export type TenantPerformersConfig = z.infer<
  typeof TenantPerformersConfigSchema
>;
