import { z } from "zod";

export enum GroupGender {
  Male = "male",
  Female = "female",
  Mixed = "mixed",
}

export const GroupAppearanceSchema = z
  .object({
    color: z.string().default("#FB923C"), // Orange-400 (matches color picker default)
  })
  .nullable();

export const GroupSchema = z.object({
  id: z.number(),
  ageRange: z.string(),
  level: z.string().nullable(),
  gender: z.string(),
  tenantId: z.number(),
  customName: z.string().nullable(),
  appearance: GroupAppearanceSchema,
});

export type GroupAppearance = z.infer<typeof GroupAppearanceSchema>;
export type Group = z.infer<typeof GroupSchema>;
export const DEFAULT_GROUP_COLOR = "#FB923C";
