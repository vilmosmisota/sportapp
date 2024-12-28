import { z } from "zod";
import { PlayerGender } from "./Player.schema";
import { Gender } from "../team/Team.schema";

// Simplified schemas for the connection relations
const PlayerInConnectionSchema = z.object({
  id: z.number(),
  firstName: z.string().nullable(),
  secondName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  gender: z.nativeEnum(PlayerGender).nullable(),
  position: z.string().nullable(),
});

const TeamInConnectionSchema = z.object({
  id: z.number(),
  age: z.string().nullable(),
  gender: z.nativeEnum(Gender).nullable(),
  skill: z.string().nullable(),
});

export const PlayerTeamConnectionSchema = z.object({
  id: z.number(),
  createdAt: z.string().optional(),
  teamId: z.number(),
  playerId: z.number(),
  tenantId: z.number(),
  // Relations with simplified schemas
  player: PlayerInConnectionSchema.nullable().optional(),
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
