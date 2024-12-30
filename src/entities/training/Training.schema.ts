import { z } from "zod";
import { TrainingLocationSchema } from "../tenant/Tenant.schema";
import { TeamSchema } from "../team/Team.schema";
import { SeasonSchema } from "../season/Season.schema";

export const TrainingSeasonConnectionSchema = z.object({
  id: z.number(),
  trainingId: z.number(),
  seasonId: z.number(),
  tenantId: z.number(),
  season: SeasonSchema.omit({
    tenantId: true,
    membershipPrices: true,
  }).nullable(),
});

export type TrainingSeasonConnection = z.infer<
  typeof TrainingSeasonConnectionSchema
>;

export const TrainingSchema = z.object({
  id: z.number(),
  date: z.string().transform((str) => new Date(str)),
  startTime: z.string(),
  endTime: z.string(),
  location: TrainingLocationSchema.nullable(),
  tenantId: z.number(),
  teamId: z.number().nullable(),
  team: TeamSchema.omit({
    tenantId: true,
    playerTeamConnections: true,
    coach: true,
    coachId: true,
    playerCount: true,
  }).nullable(),
  trainingSeasonConnections: z
    .array(TrainingSeasonConnectionSchema)
    .default([]),
});

export type Training = z.infer<typeof TrainingSchema>;

export const createTrainingFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: TrainingLocationSchema,
  teamId: z.number().nullable(),
  seasonIds: z.array(z.number()),
});

export type TrainingFormSchema = typeof createTrainingFormSchema;
export type TrainingForm = z.infer<TrainingFormSchema>;

export const GroupedTrainingSchema = z.object({
  dayOfWeek: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  location: TrainingLocationSchema,
  teamId: z.number().nullable(),
  teamName: z.string().nullable(),
  trainingCount: z.number(),
  firstDate: z.string(),
  lastDate: z.string(),
});

export type GroupedTraining = z.infer<typeof GroupedTrainingSchema>;
