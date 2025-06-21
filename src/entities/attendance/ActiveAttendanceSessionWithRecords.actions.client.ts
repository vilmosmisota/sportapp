import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  aggregateAndCleanupAttendanceSession,
  createAttendanceRecord,
  deleteAttendanceRecord,
  updateAttendanceRecord,
  updateOrCreateAttendanceRecords,
} from "./ActiveAttendanceSessionWithRecords.services";
import { AttendanceStatus } from "./AttendanceRecord.schema";

/**
 * Hook to create a new attendance record (for check-ins)
 */
export const useCreateAttendanceRecord = (
  sessionId: number,
  tenantId: string
) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      performerId,
      status = AttendanceStatus.PRESENT,
      checkInTime,
    }: {
      performerId: number;
      status?: AttendanceStatus;
      checkInTime?: string;
    }) => {
      return createAttendanceRecord(client, {
        activeAttendanceSessionId: sessionId,
        performerId,
        status,
        checkInTime,
        tenantId,
      });
    },
    onSuccess: () => {
      // Invalidate session with records
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.sessionWithRecords(
          tenantId,
          sessionId.toString()
        ),
      });

      // Invalidate attendance records for this session
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.records(tenantId, sessionId.toString()),
      });

      // Invalidate active sessions (in case this affects the session status)
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.activeSessions(tenantId),
      });

      // Invalidate all attendance data
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.all,
      });
    },
    onError: (error) => {
      console.error("Error creating attendance record:", error);
    },
  });
};

/**
 * Hook to update an attendance record
 */
export const useUpdateAttendanceRecord = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      sessionId,
      updates,
    }: {
      recordId: number;
      sessionId: number;
      updates: {
        status?: AttendanceStatus;
        checkInTime?: string;
      };
    }) => {
      return updateAttendanceRecord(client, recordId, updates, tenantId);
    },
    onSuccess: (_, variables) => {
      const { sessionId } = variables;

      // Invalidate session with records
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.sessionWithRecords(
          tenantId,
          sessionId.toString()
        ),
      });

      // Invalidate attendance records for this session
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.records(tenantId, sessionId.toString()),
      });

      // Invalidate active sessions
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.activeSessions(tenantId),
      });
    },
    onError: (error) => {
      console.error("Error updating attendance record:", error);
    },
  });
};

/**
 * Hook to bulk update or create attendance records
 */
export const useUpdateAttendanceRecords = (
  sessionId: number,
  tenantId: string
) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      records: { performerId: number; status: AttendanceStatus | null }[]
    ) => {
      return updateOrCreateAttendanceRecords(
        client,
        sessionId,
        records,
        tenantId
      );
    },
    onSuccess: () => {
      // Invalidate session with records
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.sessionWithRecords(
          tenantId,
          sessionId.toString()
        ),
      });

      // Invalidate attendance records for this session
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.records(tenantId, sessionId.toString()),
      });

      // Invalidate active sessions
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.activeSessions(tenantId),
      });

      // Invalidate all attendance data
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.all,
      });
    },
    onError: (error) => {
      console.error("Error updating attendance records:", error);
    },
  });
};

/**
 * Hook to delete an attendance record
 */
export const useDeleteAttendanceRecord = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      sessionId,
    }: {
      recordId: number;
      sessionId: number;
    }) => {
      return deleteAttendanceRecord(client, recordId, tenantId);
    },
    onSuccess: (_, variables) => {
      const { sessionId } = variables;

      // Invalidate session with records
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.sessionWithRecords(
          tenantId,
          sessionId.toString()
        ),
      });

      // Invalidate attendance records for this session
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.records(tenantId, sessionId.toString()),
      });

      // Invalidate active sessions
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.activeSessions(tenantId),
      });
    },
    onError: (error) => {
      console.error("Error deleting attendance record:", error);
    },
  });
};

/**
 * Hook to aggregate and cleanup attendance session
 */
export const useAggregateAndCleanupAttendanceSession = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      notCheckedInMemberIds = [],
    }: {
      sessionId: number;
      notCheckedInMemberIds?: number[];
    }) => {
      return aggregateAndCleanupAttendanceSession(
        client,
        sessionId,
        tenantId,
        notCheckedInMemberIds
      );
    },
    onSuccess: (_, variables) => {
      const { sessionId } = variables;

      // Invalidate the specific session with records (will be gone after aggregation)
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.sessionWithRecords(
          tenantId,
          sessionId.toString()
        ),
      });

      // Invalidate attendance records for this session (will be gone after aggregation)
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.records(tenantId, sessionId.toString()),
      });

      // Invalidate active sessions (this session will be removed)
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.activeSessions(tenantId),
      });

      // Invalidate all attendance data
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.all,
      });

      // Invalidate sessions (the original session will be marked as aggregated)
      queryClient.invalidateQueries({
        queryKey: queryKeys.session.all,
      });

      // Invalidate session-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.session.list(tenantId),
      });

      // Invalidate any aggregate data queries (if they exist)
      queryClient.invalidateQueries({
        queryKey: ["attendance", "aggregates", tenantId],
      });
    },
    onError: (error) => {
      console.error(
        "Error aggregating and cleaning up attendance session:",
        error
      );
    },
  });
};
