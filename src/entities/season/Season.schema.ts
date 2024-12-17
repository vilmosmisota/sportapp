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
  startDate: z.string().transform((item) => new Date(item)),
  endDate: z.string().transform((item) => new Date(item)),
  tenantId: z.number(),
  breaks: z.array(BreakSchema),
  membershipPrices: z.array(SeasonMembershipPriceSchema),
});

export type Season = z.infer<typeof SeasonSchema>;

export const SeasonFormSchema = SeasonSchema.omit({
  id: true,
  tenantId: true,
  membershipPrices: true,
}).extend({
  membershipPrices: z.array(
    z.object({ membershipCategoryId: z.number(), price: z.number().positive() })
  ),
});

export type SeasonForm = z.infer<typeof SeasonFormSchema>;
