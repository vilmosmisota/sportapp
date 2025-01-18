import { baseUrl, removeBaseUrl } from "@/utils/url.config";
import { z } from "zod";
import { CurrencyTypes } from "../common/Types";

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

export type GroupType = z.infer<typeof GroupTypeSchema>;

export const TrainingLocationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name is required" }),
  postcode: z.string().min(1, { message: "Postcode is required" }),
  streetAddress: z.string().min(1, { message: "Street address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  mapLink: z.string().url({ message: "Must be a valid URL" }).optional(),
});

export type TrainingLocation = z.infer<typeof TrainingLocationSchema>;

export const TenantSchema = z.object({
  id: z.number(),
  name: z.string().min(1, { message: "Name is required" }),
  type: z.nativeEnum(TenantType),
  domain: z.string().min(1, { message: "Domain is required" }),
  email: z.string().email({ message: "Invalid email" }).nullable(),
  description: z.string().nullable(),
  logo: z
    .string()
    .transform((item) => baseUrl(item))
    .nullable(),
  location: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  createdAt: z.string(),
  sport: z.nativeEnum(TenantSportType),
  membershipCurrency: z.nativeEnum(CurrencyTypes),
  groupTypes: GroupTypeSchema.nullable(),
  trainingLocations: z.array(TrainingLocationSchema).nullable(),
});

export type Tenant = z.infer<typeof TenantSchema>;

export const TenantFormSchema = TenantSchema.omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email({ message: "Invalid email" }).optional(),
  description: z.string().optional(),
  logo: z
    .string()
    .transform((item) => removeBaseUrl(item))
    .optional(),
  location: z.string().optional(),
  phoneNumber: z.string().optional(),
  groupTypes: GroupTypeSchema.optional(),
  trainingLocations: z.array(TrainingLocationSchema).optional(),
});

export type TenantForm = z.infer<typeof TenantFormSchema>;

export const TenantInfoSchema = z.object({
  type: z.nativeEnum(TenantType),
  id: z.number(),
});
