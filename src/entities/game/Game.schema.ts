import { z } from "zod";

export const GameSchema = z
  .object({
    id: z.number(),
    date: z.string(),
    start_time: z.string(),
    home_team_id: z.number(),
    away_team_id: z.number(),
    home_team_score: z.string().nullable(),
    away_team_score: z.string().nullable(),
    home_team_confirmation: z.boolean(),
    away_team_confirmation: z.boolean(),
    division_id: z.number(),
    division_name: z.string().nullable(),
    division_age: z.string().nullable(),
    division_level: z.string().nullable(),
    division_gender: z.string().nullable(),
    home_team_name: z.string(),
    away_team_name: z.string(),
    home_team_organization_name: z.string(),
    away_team_organization_name: z.string(),
    home_team_organization_short_name: z.string().nullable(),
    away_team_organization_short_name: z.string().nullable(),
  })
  .transform((item) => {
    return {
      id: item.id,
      date: item.date,
      startTime: item.start_time,
      homeTeamId: item.home_team_id,
      awayTeamId: item.away_team_id,
      homeTeamScore: item.home_team_score,
      awayTeamScore: item.away_team_score,
      homeTeamConfirmation: item.home_team_confirmation,
      awayTeamConfirmation: item.away_team_confirmation,
      divisionId: item.division_id,
      divisionName: item.division_name,
      divisionAge: item.division_age,
      divisionLevel: item.division_level,
      divisionGender: item.division_gender,
      homeTeamName: item.home_team_name,
      awayTeamName: item.away_team_name,
      homeTeamOrganizationName: item.home_team_organization_name,
      awayTeamOrganizationName: item.away_team_organization_name,
      homeTeamOrgShortName: item.home_team_organization_short_name,
      awayTeamOrgShortName: item.away_team_organization_short_name,
    };
  });
