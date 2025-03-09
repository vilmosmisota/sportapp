import { z } from "zod";
import { LocationSchema } from "../common/Location.schema";
import { TeamSchema } from "../team/Team.schema";
import { AppearanceSchema } from "../common/Appearance.schema";

// Base opponent schema
export const OpponentSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  createdAt: z.union([z.string(), z.date()]).optional(),
  location: LocationSchema.nullable().optional(),
  appearance: AppearanceSchema.nullable().optional(),
  contactEmail: z
    .union([z.string().email(), z.literal(""), z.null()])
    .optional(),
  contactPhone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  tenantId: z.number().int().positive(),
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
  contactEmail: z
    .union([z.string().email("Invalid email format"), z.literal("")])
    .optional()
    .default(""),
  contactPhone: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

// Schema for updating opponents (all fields optional)
export const OpponentUpdateSchema = OpponentFormSchema.partial();

// Type definitions
export type Opponent = z.infer<typeof OpponentSchema>;
export type OpponentForm = z.infer<typeof OpponentFormSchema>;
export type OpponentUpdate = z.infer<typeof OpponentUpdateSchema>;

export interface OpponentRepository {
  getById(id: number): Promise<Opponent | null>;
  getByTenantId(tenantId: number): Promise<Opponent[]>;
  create(opponent: Omit<Opponent, "id" | "createdAt">): Promise<Opponent>;
  update(
    id: number,
    opponent: Partial<Omit<Opponent, "id" | "createdAt" | "tenantId">>
  ): Promise<Opponent>;
  delete(id: number): Promise<boolean>;
}
