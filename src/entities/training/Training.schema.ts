import { z } from "zod";
import { TeamSchema } from "../team/Team.schema";
import { SeasonSchema } from "../season/Season.schema";
import { LocationSchema } from "../common/Location.schema";

export const TrainingSeasonConnectionSchema = z.object({
  id: z.number(),
  trainingId: z.number(),
  seasonId: z.number(),
  tenantId: z.number(),
  season: SeasonSchema.omit({
    tenantId: true,
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
  location: LocationSchema.nullable(),
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
  location: LocationSchema,
  teamId: z.number().nullable(),
  seasonIds: z.array(z.number()),
});

export type TrainingFormSchema = typeof createTrainingFormSchema;
export type TrainingForm = z.infer<TrainingFormSchema>;

export const GroupedTrainingSchema = z.object({
  dayOfWeek: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  location: LocationSchema,
  teamId: z.number().nullable(),
  teamName: z.string().nullable(),
  trainingCount: z.number(),
  firstDate: z.string(),
  lastDate: z.string(),
  team: z
    .object({
      appearance: z
        .object({
          color: z.string().nullable(),
        })
        .nullable(),
    })
    .nullable(),
});

export type GroupedTraining = z.infer<typeof GroupedTrainingSchema>;

export const UpdateTrainingPatternSchema = z.object({
  tenantId: z.number(),
  patternId: z.string(),
  updates: z.object({
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    location: LocationSchema.optional(),
    seasonId: z.number().optional(),
    fromDate: z.string().optional(),
    originalStartTime: z.string(),
    originalEndTime: z.string(),
  }),
});

export type UpdateTrainingPattern = z.infer<typeof UpdateTrainingPatternSchema>;

export const DeleteTrainingPatternSchema = z.object({
  tenantId: z.number(),
  patternId: z.string(),
  params: z.object({
    seasonId: z.number(),
    fromDate: z.string().optional(),
    originalStartTime: z.string(),
    originalEndTime: z.string(),
  }),
});

export type DeleteTrainingPattern = z.infer<typeof DeleteTrainingPatternSchema>;

export const TrainingCreateSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: LocationSchema,
  teamId: z.number().nullable(),
  seasonIds: z.array(z.number()),
});

export const TrainingUpdateSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: LocationSchema,
  teamId: z.number().nullable(),
  seasonIds: z.array(z.number()),
});

export const TrainingUpdateFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: LocationSchema.optional(),
  teamId: z.number().nullable(),
  seasonIds: z.array(z.number()),
});
