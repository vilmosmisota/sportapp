import { z } from "zod";

export const MembershipCategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string(),
  tenantId: z.number(),
});

export type MembershipCategory = z.infer<typeof MembershipCategorySchema>;

export const MembershipCategoryFormSchema = MembershipCategorySchema.omit({
  id: true,
  tenantId: true,
});

export type MembershipCategoryForm = z.infer<
  typeof MembershipCategoryFormSchema
>;
