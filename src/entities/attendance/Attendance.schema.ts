import { z } from "zod";

const baseSchema = {
  id: z.number(),
};

export enum AttendanceStatus {
  PENDING = "pending",
  PRESENT = "present",
  LATE = "late",
  ABSENT = "absent",
}

const trainingSchema = z.object({
  id: z.number(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  teamId: z.number().nullable(),
});

export const attendanceSessionSchema = z.object({
  ...baseSchema,
  trainingId: z.number().nullable(),
  seasonId: z.number().nullable(),
  tenantId: z.number().nullable(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  isActive: z.boolean().nullable(),
  training: trainingSchema.nullable(),
});

export const attendanceRecordSchema = z.object({
  ...baseSchema,
  attendanceSessionId: z.number().nullable(),
  playerId: z.number().nullable(),
  tenantId: z.number().nullable(),
  checkInTime: z.string().nullable(),
  status: z.nativeEnum(AttendanceStatus).default(AttendanceStatus.PENDING),
});

// New schemas for team statistics
export const dayOfWeekStatsSchema = z.object({
  dayOfWeek: z.string(),
  attendanceRate: z.number(),
  averagePlayersPresent: z.number(),
});

export const recentTrendSchema = z.object({
  date: z.string(),
  attendanceRate: z.number(),
  playersPresent: z.number(),
  totalPlayers: z.number(),
});

export const teamAttendanceStatsSchema = z.object({
  totalSessions: z.number(),
  averageAttendanceRate: z.number().nullable().default(0),
  averagePlayersPerSession: z.number().nullable().default(0),
  dayOfWeekStats: z.array(dayOfWeekStatsSchema).nullable().default([]),
  lateArrivalRate: z.number().nullable().default(0),
  mostConsecutiveFullAttendance: z.number(),
  recentTrend: z.array(recentTrendSchema).nullable().default([]),
});

export const playerAttendanceStatsSchema = z.object({
  playerId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  totalAttendance: z.number(),
  totalLate: z.number(),
  totalAbsent: z.number(),
  totalSessions: z.number(),
  attendancePercentage: z.number(),
});

export type AttendanceSession = z.infer<typeof attendanceSessionSchema>;
export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;
export type DayOfWeekStats = z.infer<typeof dayOfWeekStatsSchema>;
export type RecentTrend = z.infer<typeof recentTrendSchema>;
export type TeamAttendanceStats = z.infer<typeof teamAttendanceStatsSchema>;
export type PlayerAttendanceStats = z.infer<typeof playerAttendanceStatsSchema>;

export const createAttendanceSessionSchema = attendanceSessionSchema.omit({
  id: true,
  training: true,
});

export const createAttendanceRecordSchema = attendanceRecordSchema.omit({
  id: true,
});

export type CreateAttendanceSession = z.infer<
  typeof createAttendanceSessionSchema
>;
export type CreateAttendanceRecord = z.infer<
  typeof createAttendanceRecordSchema
>;

export const updateAttendanceSessionSchema =
  createAttendanceSessionSchema.partial();
export const updateAttendanceRecordSchema =
  createAttendanceRecordSchema.partial();

export type UpdateAttendanceSession = z.infer<
  typeof updateAttendanceSessionSchema
>;
export type UpdateAttendanceRecord = z.infer<
  typeof updateAttendanceRecordSchema
>;

export const attendanceSessionAggregateSchema = z.object({
  ...baseSchema,
  teamId: z.number(),
  tenantId: z.number(),
  seasonId: z.number(),
  totalSessions: z.number(),
  totalPresent: z.number(),
  totalLate: z.number(),
  totalAbsent: z.number(),
  averageAttendanceRate: z.number(),
  sessions: z.array(
    z.object({
      sessionId: z.number(),
      trainingId: z.number(),
      date: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      presentCount: z.number(),
      lateCount: z.number(),
      absentCount: z.number(),
    })
  ),
  aggregatedAt: z.string().nullable(),
});

export const attendanceRecordAggregateSchema = z.object({
  ...baseSchema,
  playerId: z.number(),
  teamId: z.number(),
  tenantId: z.number(),
  seasonId: z.number(),
  totalAttendance: z.number(),
  totalLate: z.number(),
  totalAbsent: z.number(),
  attendanceRate: z.number(),
  records: z.array(
    z.object({
      sessionId: z.number(),
      trainingId: z.number(),
      date: z.string(),
      status: z.nativeEnum(AttendanceStatus),
      checkInTime: z.string().nullable(),
    })
  ),
  aggregatedAt: z.string().nullable(),
});

export type AttendanceSessionAggregate = z.infer<
  typeof attendanceSessionAggregateSchema
>;
export type AttendanceRecordAggregate = z.infer<
  typeof attendanceRecordAggregateSchema
>;
