import { z } from "zod";
import { LocationSchema } from "../common/Location.schema";

// Base opponent schema
export const OpponentSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  location: LocationSchema.nullable(),
  tenantId: z.number().nullable(),
});

// Schema for creating/updating opponents
export const OpponentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: LocationSchema.nullable(),
  tenantId: z.number(),
});

// Schema for updating opponents (all fields optional)
export const OpponentUpdateSchema = OpponentFormSchema.partial();

// Type definitions
export type Opponent = z.infer<typeof OpponentSchema>;
export type OpponentForm = z.infer<typeof OpponentFormSchema>;
export type OpponentUpdate = z.infer<typeof OpponentUpdateSchema>;
