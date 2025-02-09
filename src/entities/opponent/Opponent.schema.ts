import { z } from "zod";
import { LocationSchema } from "../common/Location.schema";
import { TeamGender } from "../team/Team.schema";

// Group schema for opponents
export const OpponentGroupSchema = z.object({
  age: z.string(),
  skill: z.string(),
  gender: z.nativeEnum(TeamGender),
});

export type OpponentGroup = z.infer<typeof OpponentGroupSchema>;

// Base opponent schema
export const OpponentSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  location: LocationSchema.nullable(),
  tenantId: z.number().nullable(),
  groups: z.array(OpponentGroupSchema).nullable(),
});

// Schema for creating/updating opponents
export const OpponentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: LocationSchema.nullable(),
  tenantId: z.number(),
  groups: z.array(OpponentGroupSchema).nullable(),
});

// Schema for updating opponents (all fields optional)
export const OpponentUpdateSchema = OpponentFormSchema.partial();

// Type definitions
export type Opponent = z.infer<typeof OpponentSchema>;
export type OpponentForm = z.infer<typeof OpponentFormSchema>;
export type OpponentUpdate = z.infer<typeof OpponentUpdateSchema>;
