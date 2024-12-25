import { z } from "zod";

export enum Gender {
  Boys = "Boys",
  Girls = "Girls",
  Mixed = "Mixed",
}

export const TeamSchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  age: z.string().nullable(),
  gender: z.nativeEnum(Gender).nullable(),
  skill: z.string().nullable(),
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

export const createTeamFormSchema = (
  ageGroups: string[],
  skillLevels: string[]
) =>
  z.object({
    age: z.enum([...ageGroups] as [string, ...string[]]),
    gender: z.nativeEnum(Gender),
    skill: z.enum([...skillLevels] as [string, ...string[]]),
    coachId: z.string().nullable().optional(),
  });

export type TeamFormSchema = ReturnType<typeof createTeamFormSchema>;
export type TeamForm = z.infer<TeamFormSchema>;
