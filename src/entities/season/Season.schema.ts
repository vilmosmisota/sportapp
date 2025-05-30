import { z } from "zod";

export const BreakSchema = z.object({
  from: z.string().transform((item) => new Date(item)),
  to: z.string().transform((item) => new Date(item)),
});

export const SeasonSchema = z.object({
  id: z.number(),
  customName: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  tenantId: z.number(),
  isActive: z.boolean().default(false),
  breaks: z.array(BreakSchema).default([]),
});

export type Season = z.infer<typeof SeasonSchema>;

export const SeasonFormSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  customName: z.string().optional(),
  isActive: z.boolean().default(false),
  breaks: z.array(BreakSchema).default([]),
});

export type SeasonForm = z.infer<typeof SeasonFormSchema>;
