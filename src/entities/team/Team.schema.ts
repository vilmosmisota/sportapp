import { z } from "zod";

export enum AgeLevel {
  UNDER_6 = "U6",
  UNDER_8 = "U8",
  UNDER_10 = "U10",
  UNDER_12 = "U12",
  UNDER_14 = "U14",
  UNDER_16 = "U16",
  UNDER_18 = "U18",
  ADULT = "Adult",
  SENIOR = "Senior",
}

export enum SkillLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
  ELITE = "Elite",
  PROFESSIONAL = "Professional",
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  MIXED = "Mixed",
}

export const TeamSchema = z.object({
  id: z.number(),
  age: z.nativeEnum(AgeLevel).nullable(),
  skill: z.string(),
  gender: z.string(),
  tenantId: z.number(),
  clubId: z.number().nullable(),
});

export type Team = z.infer<typeof TeamSchema>;

export const TeamFormSchema = TeamSchema.omit({
  id: true,
  tenantId: true,
  clubId: true,
});

export type TeamForm = z.infer<typeof TeamFormSchema>;
