import { useActiveAttendanceSessionWithRecords } from "@/entities/attendance/ActiveAttendanceSessionWithRecords.query";
import { usePerformersByGroupId } from "@/entities/group/GroupConnection.query";
import { useMemo } from "react";
import {
  PerformerAttendanceRow,
  transformToPerformerAttendanceRows,
} from "../utils/transformAttendanceData";

/**
 * Custom hook to fetch and combine all data needed for an attendance session page
 */
export const useAttendanceSessionData = (
  sessionId: number,
  tenantId: string
) => {
  // Get the specific session with its records directly
  const { data: sessionWithRecords, isLoading: isSessionLoading } =
    useActiveAttendanceSessionWithRecords(sessionId, tenantId);

  // Get group ID from the session
  const groupId = sessionWithRecords?.session?.groupId;

  // Get performers for the group
  const { data: performers, isLoading: isPerformersLoading } =
    usePerformersByGroupId(tenantId, groupId || 0, !!groupId);

  // Extract attendance records from the session data
  const attendanceRecords = sessionWithRecords?.records || [];

  // Transform data into PerformerAttendanceRows
  const attendanceRows: PerformerAttendanceRow[] = useMemo(() => {
    if (!performers || !attendanceRecords) return [];
    return transformToPerformerAttendanceRows(performers, attendanceRecords);
  }, [performers, attendanceRecords]);

  const isLoading = isSessionLoading || isPerformersLoading;

  return {
    session: sessionWithRecords,
    performers,
    attendanceRecords,
    attendanceRows,
    isLoading,
    isSessionLoading,
    isPerformersLoading,
  };
};
