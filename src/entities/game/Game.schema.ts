import { z } from "zod";
import { TeamSchema, type Team } from "../team/Team.schema";
import { SeasonSchema, type Season } from "../season/Season.schema";
import { LocationSchema, type Location } from "../common/Location.schema";

// Game status enumeration
export enum GameStatus {
  Scheduled = "scheduled",
  InProgress = "in_progress",
  Completed = "completed",
  Canceled = "canceled",
  Postponed = "postponed",
  Forfeit = "forfeit",
  Abandoned = "abandoned",
  Draft = "draft",
}

// Game schema definition
export const GameSchema = z
  .object({
    id: z.number(),
    createdAt: z.string().transform((str) => new Date(str)),

    // Game scheduling details
    date: z.string().transform((str) => new Date(str)),
    startTime: z.string().min(1, { message: "Start time is required" }),
    endTime: z.string().nullable().optional(),

    // Teams relationship
    homeTeamId: z.number().positive({ message: "Home team must be specified" }),
    awayTeamId: z.number().positive({ message: "Away team must be specified" }),

    // Location configuration (as jsonb)
    location: LocationSchema.nullable().optional(),

    // Competition type (saved as "name#color")
    competitionType: z.string().nullable().optional(),

    // Tenant and season references
    tenantId: z.number().positive({ message: "Tenant ID is required" }),
    seasonId: z.number().nullable().optional(),

    // Game status and results
    status: z.nativeEnum(GameStatus).default(GameStatus.Scheduled),
    homeScore: z.number().nullable().optional(),
    awayScore: z.number().nullable().optional(),

    // Additional metadata
    notes: z.string().nullable().optional(),

    // Optional related data (populated via joins)
    homeTeam: TeamSchema.nullable().optional(),
    awayTeam: TeamSchema.nullable().optional(),
    season: SeasonSchema.nullable().optional(),
  })
  .refine(
    (data) =>
      !data.homeTeamId ||
      !data.awayTeamId ||
      data.homeTeamId !== data.awayTeamId,
    {
      message: "Home team and away team must be different",
      path: ["awayTeamId"],
    }
  );

export type Game = z.infer<typeof GameSchema>;

// Helper function to extract competition name from "name#color" format
export const getCompetitionName = (
  competitionType: string | null | undefined
): string => {
  if (!competitionType) return "";
  return competitionType.split("#")[0];
};

// Helper function to extract competition color from "name#color" format
export const getCompetitionColor = (
  competitionType: string | null | undefined
): string => {
  if (!competitionType) return "";
  const parts = competitionType.split("#");
  return parts.length > 1 ? parts[1] : "";
};

// Game form schema for creating/editing games
export const GameFormSchema = z
  .object({
    date: z.date({
      required_error: "Date is required",
      invalid_type_error: "Date must be a valid date",
    }),
    startTime: z.string().min(1, { message: "Start time is required" }),
    endTime: z.string().nullable().optional(),
    homeTeamId: z
      .number({
        required_error: "Home team is required",
        invalid_type_error: "Home team must be a number",
      })
      .positive({ message: "Please select a valid home team" }),
    awayTeamId: z
      .number({
        required_error: "Away team is required",
        invalid_type_error: "Away team must be a number",
      })
      .positive({ message: "Please select a valid away team" }),
    location: LocationSchema.nullable().optional(),
    competitionType: z.string().nullable().optional(),
    seasonId: z.number().nullable().optional(),
    status: z
      .nativeEnum(GameStatus, {
        required_error: "Status is required",
        invalid_type_error: "Status must be valid",
      })
      .default(GameStatus.Scheduled),
    homeScore: z.number().nullable().optional(),
    awayScore: z.number().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .refine((data) => data.homeTeamId !== data.awayTeamId, {
    message: "Home team and away team must be different",
    path: ["awayTeamId"],
  })
  .refine(
    (data) => {
      // If endTime is provided, ensure it's after startTime
      if (data.endTime && data.startTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export type GameForm = z.infer<typeof GameFormSchema>;
