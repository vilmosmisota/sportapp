import { baseUrl, removeBaseUrl } from "@/utils/url.config";
import { z } from "zod";
import { CurrencyTypes } from "../common/Types";
import { LocationSchema } from "../common/Location.schema";

export enum TenantType {
  LEAGUE = "league",
  ORGANIZATION = "organization",
}

export enum TenantSportType {
  WATERPOLO = "water polo",
  FOOTBALL = "football",
  TENNIS = "tennis",
  GYMNASTICS = "gymnastics",
  SWIMMING = "swimming",
  VOLLEYBALL = "volleyball",
  BASKETBALL = "basketball",
}

export const GroupTypeSchema = z.object({
  ageGroups: z.array(z.string()),
  skillLevels: z.array(z.string()),
  positions: z.array(z.string()).default([]),
});

export const PlayerSettingsSchema = z.object({
  positions: z.array(z.string()).optional().nullable(),
});

export type GroupType = z.infer<typeof GroupTypeSchema>;

export type TrainingLocation = z.infer<typeof LocationSchema>;
export type GameLocation = z.infer<typeof LocationSchema>;

export const TenantFeaturesSchema = z.object({
  id: z.number(),
  tenantId: z.number().nullable(),
  websiteBuilder: z.boolean().nullable(),
});

export type TenantFeatures = z.infer<typeof TenantFeaturesSchema>;

// Define the competition type schema
export const CompetitionTypeSchema = z.object({
  name: z.string(),
  color: z.string().optional(),
});

export type CompetitionType = z.infer<typeof CompetitionTypeSchema>;

export const TenantSchema = z.object({
  id: z.number(),
  name: z.string().min(1, { message: "Name is required" }),
  type: z.nativeEnum(TenantType),
  domain: z.string().min(1, { message: "Domain is required" }),
  email: z.string().email({ message: "Invalid email" }).nullable(),
  description: z.string().nullable(),
  logo: z.string().nullable(),
  location: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  createdAt: z.string(),
  sport: z.nativeEnum(TenantSportType),
  membershipCurrency: z.nativeEnum(CurrencyTypes),
  groupTypes: GroupTypeSchema.nullable(),
  trainingLocations: z.array(LocationSchema).nullable(),
  gameLocations: z.array(LocationSchema).nullable(),
  lateThresholdMinutes: z.number().min(0).nullable().default(5),
  isPublicSitePublished: z.boolean().nullable().default(false),
  competitionTypes: z.array(CompetitionTypeSchema).nullable(),
  playerSettings: PlayerSettingsSchema.nullable(),
});

export type Tenant = z.infer<typeof TenantSchema>;

export const TenantFormSchema = TenantSchema.omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email({ message: "Invalid email" }).optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  location: z.string().optional(),
  phoneNumber: z.string().optional(),
  groupTypes: GroupTypeSchema.optional(),
  trainingLocations: z.array(LocationSchema).optional(),
  gameLocations: z.array(LocationSchema).optional(),
  competitionTypes: z.array(CompetitionTypeSchema).optional(),
  playerSettings: PlayerSettingsSchema.optional(),
});

export type TenantForm = z.infer<typeof TenantFormSchema>;

export const TenantInfoSchema = z.object({
  type: z.nativeEnum(TenantType),
  id: z.number(),
  isPublicSitePublished: z.boolean().nullable(),
});
