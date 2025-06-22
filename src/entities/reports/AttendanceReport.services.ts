import { TypedClient } from "@/libs/supabase/type";
import {
  AttendanceSessionAggregateWithGroup,
  AttendanceSessionAggregateWithGroupSchema,
} from "./AttendanceReport.schemas";

/**
 * Get attendance session aggregates for a season with group information
 */
export const getAttendanceSessionAggregatesBySeason = async (
  client: TypedClient,
  tenantId: number,
  seasonId: number
): Promise<AttendanceSessionAggregateWithGroup[]> => {
  const { data, error } = await client
    .from("attendanceSessionAggregates")
    .select(
      `
      *,
      group:groups(
        *
      )
    `
    )
    .eq("tenantId", tenantId)
    .eq("seasonId", seasonId);

  if (error) throw error;

  if (!data) return [];

  try {
    const validatedData = data.map((item) =>
      AttendanceSessionAggregateWithGroupSchema.parse(item)
    );
    return validatedData;
  } catch (validationError) {
    console.error(
      "Attendance session aggregate data validation failed:",
      validationError
    );
    throw new Error(
      "Invalid attendance session aggregate data received from database"
    );
  }
};

export const getAttendanceSessionAggregatesByGroup = async (
  client: TypedClient,
  tenantId: number,
  groupId: number,
  seasonId: number
): Promise<AttendanceSessionAggregateWithGroup> => {
  const { data, error } = await client
    .from("attendanceSessionAggregates")
    .select(
      `
      *,
      group:groups(
        *
      )
    `
    )
    .eq("tenantId", tenantId)
    .eq("groupId", groupId)
    .eq("seasonId", seasonId)
    .single();

  if (error) throw error;

  if (!data) {
    throw new Error("Attendance session aggregate not found");
  }

  try {
    const validatedData = AttendanceSessionAggregateWithGroupSchema.parse(data);
    return validatedData;
  } catch (validationError) {
    console.error(
      "Attendance session aggregate data validation failed:",
      validationError
    );
    throw new Error(
      "Invalid attendance session aggregate data received from database"
    );
  }
};
