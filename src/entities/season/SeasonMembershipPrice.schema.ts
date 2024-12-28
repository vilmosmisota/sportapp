import { z } from "zod";
import { MembershipCategorySchema } from "../membership-category/MembershipCategory.schema";
import { SeasonSchema } from "./Season.schema";

export const SeasonMembershipPriceSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  price: z.number(),
  seasonId: z.number(),
  membershipCategoryId: z.number(),
  tenantId: z.number(),
  // Relations
  season: SeasonSchema.nullable(),
  membershipCategory: MembershipCategorySchema.nullable(),
});

export type SeasonMembershipPrice = z.infer<typeof SeasonMembershipPriceSchema>;

export const createSeasonMembershipPriceFormSchema = () =>
  z.object({
    price: z.number().min(0, "Price must be positive"),
    seasonId: z.number(),
    membershipCategoryId: z.number(),
  });

export type SeasonMembershipPriceFormSchema = ReturnType<
  typeof createSeasonMembershipPriceFormSchema
>;
export type SeasonMembershipPriceForm =
  z.infer<SeasonMembershipPriceFormSchema>;
