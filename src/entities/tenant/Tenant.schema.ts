import { baseUrl, removeBaseUrl } from "@/utils/url.config";
import { addMonths } from "date-fns";
import { start } from "repl";
import { z } from "zod";
import { CurrencyTypes } from "../common/Types";

export enum TenantType {
  LEAGUE = "league",
  ORGANIZATION = "organization",
}

export enum TenantSportType {
  WATERPOLO = "water polo",
}

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
});

export type TenantForm = z.infer<typeof TenantFormSchema>;

export const TenantInfoSchema = z.object({
  type: z.nativeEnum(TenantType),
  id: z.number(),
});
