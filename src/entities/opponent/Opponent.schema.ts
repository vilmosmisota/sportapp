import { z } from "zod";
import { LocationSchema } from "../common/Location.schema";
import { TeamSchema } from "../team/Team.schema";
import { AppearanceSchema } from "../common/Appearance.schema";

// Base opponent schema
export const OpponentSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  location: LocationSchema.nullable(),
  tenantId: z.number().nullable(),
  appearance: AppearanceSchema.nullable().optional(),
  teams: z.array(TeamSchema).nullable(),
});

// Schema for creating/updating opponents
export const OpponentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: LocationSchema.nullable(),
  tenantId: z.number(),
  appearance: AppearanceSchema.nullable().optional(),
  teamIds: z.array(z.number()).nullable(),
  teams: z
    .array(
      z.object({
        age: z.string().nullable(),
        gender: z.string().nullable(),
        skill: z.string().nullable(),
        appearance: AppearanceSchema.nullable().optional(),
      })
    )
    .nullable(),
});

// Schema for updating opponents (all fields optional)
export const OpponentUpdateSchema = OpponentFormSchema.partial();

// Type definitions
export type Opponent = z.infer<typeof OpponentSchema>;
export type OpponentForm = z.infer<typeof OpponentFormSchema>;
export type OpponentUpdate = z.infer<typeof OpponentUpdateSchema>;

// Junction table schema
export const OpponentTeamSchema = z.object({
  id: z.number(),
  opponentId: z.number().nullable(),
  teamId: z.number().nullable(),
  tenantId: z.number().nullable(),
});

export type OpponentTeam = z.infer<typeof OpponentTeamSchema>;
