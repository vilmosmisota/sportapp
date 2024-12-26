import { z } from "zod";
import { MembershipCategorySchema } from "../membership-category/MembershipCategory.schema";
import { SeasonSchema } from "../season/Season.schema";
import { PlayerSchema } from "./Player.schema";

export const PlayerMembershipSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  playerId: z.number(),
  seasonId: z.number(),
  memberhsipCategoryId: z.number(),
  joinDate: z.string(),
  // Relations
  player: PlayerSchema.nullable(),
  season: SeasonSchema.nullable(),
  membershipCategory: MembershipCategorySchema.nullable(),
});

export type PlayerMembership = z.infer<typeof PlayerMembershipSchema>;

export const createPlayerMembershipFormSchema = () =>
  z.object({
    playerId: z.number(),
    seasonId: z.number(),
    memberhsipCategoryId: z.number(),
    joinDate: z.string(),
  });

export type PlayerMembershipFormSchema = ReturnType<
  typeof createPlayerMembershipFormSchema
>;
export type PlayerMembershipForm = z.infer<PlayerMembershipFormSchema>;

// For season membership prices
export const SeasonMembershipPriceSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  price: z.number(),
  seasonId: z.number(),
  membershipCategoryId: z.number(),
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
