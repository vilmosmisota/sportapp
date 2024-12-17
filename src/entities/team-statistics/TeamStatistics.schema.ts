import { z } from "zod";

export const TeamTableSchema = z.object({
  divisionId: z.number().nullable(),
  draws: z.number().nullable(),
  goalsAgainst: z.number().nullable(),
  goalsFor: z.number().nullable(),
  goalDifference: z.number().optional(),
  id: z.number(),
  losses: z.number().nullable(),
  points: z.number().nullable(),
  streak: z.string().nullable(),
  teamId: z.number().nullable(),

  wins: z.number().nullable(),
  teams: z.object({
    clubId: z.number(),
    clubs: z.object({
      name: z.string().nullable(),
      shortName: z.string().nullable(),
    }),
  }),
});

export const DivisionsSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  age: z.string().nullable(),
  level: z.string().nullable(),
  gender: z.string().nullable(),
  teamStatistics: z.array(TeamTableSchema),
});

export const TeamTableOnDivisionsSchema = z
  .object({
    id: z.number(),
    divisions: z.array(DivisionsSchema),
  })
  .transform(({ id, ...rest }) => ({
    tenantId: id,
    ...rest,
  }));
