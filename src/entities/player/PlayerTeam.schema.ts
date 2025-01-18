import { z } from "zod";
import { PlayerGender } from "./Player.schema";
import { TeamGender } from "../team/Team.schema";

// Schema for the nested player object
const PlayerInConnectionSchema = z.object({
  id: z.number(),
  pin: z.union([
    z.string().regex(/^\d{4}$/, "If provided, PIN must be a 4-digit number"),
    z.string().max(0),
    z.null(),
    z.undefined(),
  ]),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  gender: z.nativeEnum(PlayerGender),
  position: z.string(),
});

const TeamInConnectionSchema = z.object({
  id: z.number(),
  age: z.string().nullable(),
  gender: z.nativeEnum(TeamGender).nullable(),
  skill: z.string().nullable(),
});

export const PlayerTeamConnectionSchema = z.object({
  id: z.number(),
  player: PlayerInConnectionSchema,
  teamId: z.number().optional(),
  playerId: z.number().optional(),
  tenantId: z.number().optional(),
  team: TeamInConnectionSchema.nullable().optional(),
});

export type PlayerTeamConnection = z.infer<typeof PlayerTeamConnectionSchema>;

export const createPlayerTeamConnectionFormSchema = () =>
  z.object({
    teamId: z.number(),
    playerId: z.number(),
  });

export type PlayerTeamConnectionFormSchema = ReturnType<
  typeof createPlayerTeamConnectionFormSchema
>;
export type PlayerTeamConnectionForm = z.infer<PlayerTeamConnectionFormSchema>;
