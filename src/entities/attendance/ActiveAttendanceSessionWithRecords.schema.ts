import { z } from "zod";
import { ActiveAttendanceSessionSchema } from "./ActiveAttendanceSession.schema";
import { AttendanceRecordSchema } from "./AttendanceRecord.schema";

export const ActiveAttendanceSessionWithRecordsSchema =
  ActiveAttendanceSessionSchema.extend({
    records: z.array(AttendanceRecordSchema),
  });

export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;
export type ActiveAttendanceSessionWithRecords = z.infer<
  typeof ActiveAttendanceSessionWithRecordsSchema
>;
