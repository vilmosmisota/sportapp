import { z } from "zod";

export const ActiveAttendanceSessionSchema = z.object({
  id: z.number(),
  seasonId: z.number(),
  tenantId: z.number().nullable(),
  sessionId: z.number(),
  session: z.object({
    id: z.number(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    location: z.any().nullable(),
    tenantId: z.number(),
    groupId: z.number(),
    seasonId: z.number(),
    isAggregated: z.boolean().default(false),
  }),
});

export type ActiveAttendanceSession = z.infer<
  typeof ActiveAttendanceSessionSchema
>;
