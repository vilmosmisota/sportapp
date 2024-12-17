import { z } from "zod";

export const GameSchema = z.object({
  id: z.number(),
  date: z.string(),
  startTime: z.string(),
  homeTeamId: z.number(),
  awayTeamId: z.number(),
  homeTeamScore: z.string().optional(),
  awayTeamScore: z.string().optional(),
  homeTeamConfirmation: z.boolean().optional(),
  awayTeamConfirmation: z.boolean().optional(),
  divisionId: z.number().optional(),
  divisionName: z.string().optional(),
  divisionAge: z.string().optional(),
  divisionLevel: z.string().optional(),
  divisionGender: z.string().optional(),
  homeTeamName: z.string(),
  awayTeamName: z.string(),
  homeTeamClubName: z.string(),
  awayTeamClubName: z.string(),
  homeTeamClubShortName: z.string().optional(),
  awayTeamClubShortName: z.string().optional(),
  postalCode: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  countryCode: z.string().optional(),
});

export const GameMutationSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  homeTeamId: z.number(),
  awayTeamId: z.number(),
  divisionId: z.number(),
  postalCode: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  countryCode: z.string().optional(),
  mapLink: z.string().optional(),
});

export type GameMutation = z.infer<typeof GameMutationSchema>;
