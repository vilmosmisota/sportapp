import { z } from "zod";
import { MembershipCategorySchema } from "../membership-category/MembershipCategory.schema";

export const BreakSchema = z.object({
  from: z.string().transform((item) => new Date(item)),
  to: z.string().transform((item) => new Date(item)),
});

export const SeasonMembershipPriceSchema = z.object({
  id: z.number(),
  membershipCategoryId: z.number(),
  price: z.number().positive(),
  createdAt: z.string().transform((item) => new Date(item)),
  membershipCategory: MembershipCategorySchema.omit({ tenantId: true }),
});
export type SeasonMembershipPrice = z.infer<typeof SeasonMembershipPriceSchema>;

export const SeasonSchema = z.object({
  id: z.number(),
  customName: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  tenantId: z.number(),
  isActive: z.boolean().default(false),
  breaks: z.array(BreakSchema).default([]),
  membershipPrices: z.array(SeasonMembershipPriceSchema).default([]),
  phases: z.array(z.string()).nullable().default(null),
});

export type Season = z.infer<typeof SeasonSchema>;

export const SeasonFormSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  customName: z.string().optional(),
  isActive: z.boolean().default(false),
  breaks: z.array(BreakSchema).default([]),
  membershipPrices: z.array(
    z.object({ membershipCategoryId: z.number(), price: z.number().positive() })
  ),
  phases: z.array(z.string()).nullable().default(null),
});

export type SeasonForm = z.infer<typeof SeasonFormSchema>;
