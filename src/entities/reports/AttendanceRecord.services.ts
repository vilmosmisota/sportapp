import { TypedClient } from "@/libs/supabase/type";
import {
  AttendanceRecordAggregate,
  AttendanceRecordAggregateSchema,
} from "./AttendanceRecord.schema";

/**
 * Get attendance record aggregates for all members in a group
 */
export const getAttendanceRecordAggregatesByGroup = async (
  client: TypedClient,
  tenantId: number,
  groupId: number,
  seasonId?: number
): Promise<AttendanceRecordAggregate[]> => {
  let query = client
    .from("attendanceRecordAggregates")
    .select(
      `
      *,
      member:members(
        id,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        memberType
      )
    `
    )
    .eq("tenantId", tenantId)
    .eq("groupId", groupId);

  // Add season filter if provided
  if (seasonId !== undefined) {
    query = query.eq("seasonId", seasonId);
  }

  const { data, error } = await query;

  if (error) throw error;

  if (!data) return [];

  try {
    const validatedData = data.map((item) =>
      AttendanceRecordAggregateSchema.parse(item)
    );
    return validatedData;
  } catch (validationError) {
    console.error(
      "Attendance record aggregate data validation failed:",
      validationError
    );
    throw new Error(
      "Invalid attendance record aggregate data received from database"
    );
  }
};
