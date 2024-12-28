import { z } from "zod";
import { MembershipCategorySchema } from "../membership-category/MembershipCategory.schema";

const MembershipCategoryInMembershipSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  description: z.string().nullable(),
});

export const PlayerMembershipSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  playerId: z.number(),
  memberhsipCategoryId: z.number(),
  joinDate: z.string(),
  // Relations
  membershipCategory: MembershipCategoryInMembershipSchema.nullable(),
});

export type PlayerMembership = z.infer<typeof PlayerMembershipSchema>;

export const createPlayerMembershipFormSchema = () =>
  z.object({
    playerId: z.number(),
    memberhsipCategoryId: z.number(),
    joinDate: z.string(),
  });

export type PlayerMembershipFormSchema = ReturnType<
  typeof createPlayerMembershipFormSchema
>;
export type PlayerMembershipForm = z.infer<PlayerMembershipFormSchema>;
