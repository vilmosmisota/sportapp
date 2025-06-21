import { z } from "zod";

export enum AttendanceStatus {
  PENDING = "pending",
  PRESENT = "present",
  LATE = "late",
  ABSENT = "absent",
}

export enum CheckInType {
  SELF = "self",
  INSTRUCTOR = "instructor",
}

export const AttendanceRecordSchema = z.object({
  id: z.number(),
  activeAttendanceSessionId: z.number(),
  memberId: z.number(),
  tenantId: z.number(),
  checkInTime: z.string().nullable(),
  status: z.nativeEnum(AttendanceStatus),
  checkInType: z.nativeEnum(CheckInType).nullable(),
});

export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;
