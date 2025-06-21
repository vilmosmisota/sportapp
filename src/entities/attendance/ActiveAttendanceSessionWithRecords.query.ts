import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import {
  getActiveAttendanceSessionWithRecords,
  getAttendanceRecordsBySession,
} from "./ActiveAttendanceSessionWithRecords.services";

/**
 * Hook to fetch active attendance session with all records and performer details
 */
export const useActiveAttendanceSessionWithRecords = (
  sessionId: number,
  tenantId: string
) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.attendance.sessionWithRecords(
      tenantId,
      sessionId.toString()
    ),
    queryFn: async () => {
      if (!sessionId || !tenantId) return null;
      return getActiveAttendanceSessionWithRecords(client, sessionId, tenantId);
    },
    enabled: !!sessionId && !!tenantId,
  });
};

/**
 * Hook to fetch attendance records for a session
 */
export const useAttendanceRecordsBySession = (
  sessionId: number,
  tenantId: string
) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.attendance.records(tenantId, sessionId.toString()),
    queryFn: async () => {
      if (!sessionId || !tenantId) return [];
      return getAttendanceRecordsBySession(client, sessionId, tenantId);
    },
    enabled: !!sessionId && !!tenantId,
  });
};
