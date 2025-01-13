import { z } from "zod";

const baseSchema = {
  id: z.number(),
};

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
  isLate: z.boolean().nullable(),
  status: z.string().nullable(),
});

export type AttendanceSession = z.infer<typeof attendanceSessionSchema>;
export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;

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
