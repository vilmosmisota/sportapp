import { z } from "zod";
import { AttendanceStatus } from "../attendance/AttendanceRecord.schema";

export const AttendanceMemberRecordSchema = z.object({
  sessionId: z.number(),
  date: z.string(),
  status: z.nativeEnum(AttendanceStatus),
  checkInTime: z.string().nullable(),
});

// Member data schema for the joined member information
export const MemberSchema = z.object({
  id: z.number(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  gender: z.string().nullable(),
  memberType: z.string(),
});

export const AttendanceRecordAggregateSchema = z.object({
  id: z.number(),
  memberId: z.number(),
  groupId: z.number(),
  tenantId: z.number(),
  seasonId: z.number(),
  totalOnTime: z.number(),
  totalLate: z.number(),
  totalAbsent: z.number(),
  attendanceRate: z.number(),
  records: z.array(AttendanceMemberRecordSchema),
  aggregatedAt: z.string().nullable(),
  // Add member data from the join
  member: MemberSchema,
});

export type AttendanceRecordAggregate = z.infer<
  typeof AttendanceRecordAggregateSchema
>;

export type AttendanceMemberRecord = z.infer<
  typeof AttendanceMemberRecordSchema
>;

export type Member = z.infer<typeof MemberSchema>;
