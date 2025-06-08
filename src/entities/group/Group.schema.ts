import { z } from "zod";

export enum GroupGender {
  Male = "male",
  Female = "female",
  Mixed = "mixed",
}

export const GroupAppearanceSchema = z
  .object({
    color: z.string().optional(),
  })
  .nullable();

export const GroupSchema = z.object({
  id: z.number(),
  ageRange: z.string(),
  level: z.string().nullable(),
  gender: z.string(),
  tenantId: z.number(),
  appearance: GroupAppearanceSchema,
});

export type GroupAppearance = z.infer<typeof GroupAppearanceSchema>;
export type Group = z.infer<typeof GroupSchema>;
