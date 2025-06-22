import { z } from "zod";
import { GroupSchema } from "../group/Group.schema";

export const AttendanceSessionRecordSchema = z.object({
  sessionId: z.number(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  onTimeCount: z.number(),
  lateCount: z.number(),
  absentCount: z.number(),
});

export const AttendanceSessionAggregateSchema = z.object({
  id: z.number(),
  groupId: z.number(),
  tenantId: z.number(),
  seasonId: z.number(),
  totalSessions: z.number(),
  totalOnTime: z.number(),
  totalLate: z.number(),
  totalAbsent: z.number(),
  averageAttendanceRate: z.number(),
  sessions: z.array(AttendanceSessionRecordSchema),
  aggregatedAt: z.string().nullable(),
});

export const AttendanceSessionAggregateWithGroupSchema =
  AttendanceSessionAggregateSchema.extend({
    group: GroupSchema,
  });

// Type exports
export type AttendanceSessionRecord = z.infer<
  typeof AttendanceSessionRecordSchema
>;
export type AttendanceSessionAggregate = z.infer<
  typeof AttendanceSessionAggregateSchema
>;
export type AttendanceSessionAggregateWithGroup = z.infer<
  typeof AttendanceSessionAggregateWithGroupSchema
>;
