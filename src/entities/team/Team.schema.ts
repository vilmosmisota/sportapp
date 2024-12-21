import { z } from "zod";


export enum AgeLevel {
  U8 = "U8",
  U10 = "U10",
  U12 = "U12",
  U14 = "U14",
  U16 = "U16",
  U18 = "U18",
}

export enum Gender {
  Boys = "Boys",
  Girls = "Girls",
  Mixed = "Mixed",
}

export enum SkillLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Elite = "Elite",
}

export const TeamSchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  age: z.nativeEnum(AgeLevel).nullable(),
  gender: z.nativeEnum(Gender).nullable(),
  skill: z.nativeEnum(SkillLevel).nullable(),
  playerCount: z.number().nullable().optional(),
  tenantId: z.number(),
  coachId: z.string().nullable().optional(),
  coach: z
    .object({
      id: z.string(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
    })
    .nullable()
    .optional(),
});

export type Team = z.infer<typeof TeamSchema>;

export const TeamFormSchema = z.object({
  age: z.nativeEnum(AgeLevel),
  gender: z.nativeEnum(Gender),
  skill: z.nativeEnum(SkillLevel),
  coachId: z.string().nullable().optional(),
});

export type TeamForm = z.infer<typeof TeamFormSchema>;


