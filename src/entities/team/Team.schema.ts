import { z } from "zod";
import { AppearanceSchema } from "../common/Appearance.schema";

export enum TeamGender {
  Male = "Male",
  Female = "Female",
  Mixed = "Mixed",
}

export const getDisplayGender = (
  gender: TeamGender | null | undefined | string,
  age: string | null | undefined
): string => {
  if (!gender) return "";
  if (gender === TeamGender.Mixed) return "Mixed";

  // Extract age number from string (e.g., "u18" -> 18)
  const ageMatch = age?.match(/u(\d+)/i);
  const ageNumber = ageMatch ? parseInt(ageMatch[1], 10) : null;

  if (gender === TeamGender.Male) {
    if (!age) return "Men";
    return ageNumber && ageNumber < 18 ? "Boys" : "Men";
  }

  if (gender === TeamGender.Female) {
    if (!age) return "Women";
    return ageNumber && ageNumber < 18 ? "Girls" : "Women";
  }

  return gender;
};

export const getDisplayAgeGroup = (
  ageGroup: string | null | undefined
): string => {
  if (!ageGroup) return "";
  return ageGroup.split("#")[0];
};

export const PlayerTeamConnectionSchema = z.object({
  id: z.number(),
  player: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.string(),
    position: z.string(),
    gender: z.string(),
    pin: z.union([
      z.string().regex(/^\d{4}$/, "If provided, PIN must be a 4-digit number"),
      z.string().max(0),
      z.null(),
      z.undefined(),
    ]),
  }),
});

export const TeamSchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  age: z.string().nullable(),
  gender: z.nativeEnum(TeamGender).nullable(),
  skill: z.string().nullable(),
  playerCount: z.number().nullable().optional(),
  tenantId: z.number(),
  coachId: z.string().nullable().optional(),
  opponentId: z.number().nullable().optional(),
  appearance: AppearanceSchema.nullable().optional(),
  coach: z
    .object({
      id: z.string(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
    })
    .nullable()
    .optional(),
  playerTeamConnections: z.array(PlayerTeamConnectionSchema).optional(),
});

export type Team = z.infer<typeof TeamSchema>;

export const createTeamFormSchema = (
  ageGroups: string[],
  skillLevels: string[]
) =>
  z.object({
    age: z.enum([...ageGroups] as [string, ...string[]]),
    gender: z.nativeEnum(TeamGender),
    skill: z.enum([...skillLevels] as [string, ...string[]]),
    coachId: z.string().nullable().optional(),
    appearance: AppearanceSchema.nullable().optional(),
    opponentId: z.number().nullable().optional(),
  });

export type TeamFormSchema = ReturnType<typeof createTeamFormSchema>;
export type TeamForm = z.infer<TeamFormSchema>;

// Helper function to determine if a team belongs to an opponent
export const isOpponentTeam = (team: Team): boolean => {
  return team.opponentId !== null && team.opponentId !== undefined;
};
