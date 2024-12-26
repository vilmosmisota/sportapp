import { z } from "zod";
import { PlayerSchema } from "./Player.schema";
import { TeamSchema } from "../team/Team.schema";

export const PlayerTeamConnectionSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  teamId: z.number(),
  playerId: z.number(),
  tenantId: z.number(),
  // Relations
  player: PlayerSchema.nullable(),
  team: TeamSchema.nullable(),
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
