import { z } from "zod";

export const TeamTableSchema = z
  .object({
    division_id: z.number().nullable(),
    draws: z.number().nullable(),
    goals_against: z.number().nullable(),
    goals_for: z.number().nullable(),
    id: z.number(),
    losses: z.number().nullable(),
    points: z.number().nullable(),
    streak: z.string().nullable(),
    team_id: z.number().nullable(),
    wins: z.number().nullable(),
    teams: z.object({
      organization_id: z.number(),
      organizations: z.object({
        name: z.string().nullable(),
        short_name: z.string().nullable(),
      }),
    }),
  })
  .transform((value) => ({
    divisionId: value.division_id,
    draws: value.draws,
    goalsAgainst: value.goals_against,
    goalsFor: value.goals_for,
    id: value.id,
    losses: value.losses,
    points: value.points,
    streak: value.streak?.toUpperCase(),
    teamId: value.team_id,
    wins: value.wins,
    organizationName: value.teams.organizations.name,
    organizationShortName: value.teams.organizations.short_name,
    organizationId: value.teams.organization_id,
  }));

export const DivisionsSchema = z
  .object({
    id: z.number(),
    name: z.string().nullable(),
    age: z.string().nullable(),
    level: z.string().nullable(),
    gender: z.string().nullable(),
    team_statistics: z.array(TeamTableSchema),
  })
  .transform((value) => ({
    teamStatistics: value.team_statistics,
    ...value,
  }));

export const TeamTableOnDivisionsSchema = z
  .object({
    id: z.number(),
    divisions: z.array(DivisionsSchema),
  })
  .transform(({ id, ...rest }) => ({
    tenantId: id,
    ...rest,
  }));
