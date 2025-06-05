import { TypedClient } from "@/libs/supabase/type";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  createAttendanceSession,
  updateAttendanceSession,
  deleteAttendanceSession,
  getTeamAttendanceAggregates,
  getPlayerAttendanceAggregates,
  getAllTeamPlayerAttendanceAggregates,
  closeAttendanceSession,
  updateOrCreateAttendanceRecords,
} from "./Attendance.services";
import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { createAttendanceRecord } from "./Attendance.services";
import { AttendanceStatus } from "./Attendance.schema";

export const useCreateAttendanceSession = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      trainingId,
      tenantId,
      endTime,
      seasonId,
    }: {
      trainingId: number;
      tenantId: string;
      endTime: string;
      seasonId: number;
    }) => {
      const currentTime = new Date();
      const formattedCurrentTime = currentTime.toLocaleTimeString("en-GB", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const session = await createAttendanceSession(
        client,
        {
          trainingId,
          seasonId,
          tenantId: Number(tenantId),
          startTime: formattedCurrentTime,
          endTime,
          isActive: true,
        },
        tenantId
      );

      return session;
    },
    onSuccess: (data, variables) => {
      // Invalidate all attendance data
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.all,
      });

      // Specifically invalidate active sessions to update the carousel
      // Include the tenant ID in the query key
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.activeSessions, variables.tenantId],
      });

      // Invalidate training data if there are any dependencies
      queryClient.invalidateQueries({
        queryKey: queryKeys.training.all,
      });
    },
  });
};

export const useCreateAttendanceRecord = (
  sessionId: number,
  tenantId: string
) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playerId,
      status = AttendanceStatus.PRESENT,
    }: {
      playerId: number;
      status?: AttendanceStatus;
    }) => {
      const now = new Date();
      const checkInTime = now.toLocaleTimeString("en-GB", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      return createAttendanceRecord(
        client,
        {
          attendanceSessionId: sessionId,
          playerId,
          tenantId: Number(tenantId),
          status,
          checkInTime,
        },
        tenantId
      );
    },
    onSuccess: () => {
      // Invalidate specific records for this session
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.records, sessionId, tenantId],
      });

      // Invalidate session detail
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.detail(tenantId, sessionId.toString())],
      });

      // Invalidate active sessions (in case this affects the session status in the carousel)
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.activeSessions, tenantId],
      });
    },
  });
};

export const useCloseAttendanceSession = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      tenantId,
      notCheckedInPlayerIds,
    }: {
      sessionId: number;
      tenantId: string;
      notCheckedInPlayerIds: number[];
    }) => {
      const result = await closeAttendanceSession(
        client,
        sessionId,
        tenantId,
        notCheckedInPlayerIds
      );

      // Return the result to be used in onSuccess/onError callbacks
      return result;
    },
    onSuccess: (data, variables) => {
      // Since the records are now deleted, we need to invalidate different queries

      // Invalidate active sessions with the tenant ID
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.activeSessions, variables.tenantId],
      });

      // Invalidate all attendance data
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.all,
      });

      // Invalidate aggregate stats which now contain the summarized data
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.teamStats],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.stats],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.aggregates],
      });

      // We don't need to invalidate records for this session since they're deleted
      // But we should invalidate the session itself
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.sessions, variables.tenantId],
      });
    },
    onError: (error) => {
      console.error("Error in closeAttendanceSession:", error);
    },
  });
};

export const useDeleteAttendanceSession = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      sessionId,
      tenantId,
    }: {
      sessionId: number;
      tenantId: string;
    }) => {
      await deleteAttendanceSession(client, sessionId, tenantId);
    },
    onSuccess: (data, variables) => {
      // Invalidate all attendance data
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.all,
      });

      // Invalidate active sessions with the tenant ID
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.activeSessions, variables.tenantId],
      });

      // Invalidate sessions list with the tenant ID
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.sessions, variables.tenantId],
      });

      // Invalidate aggregate stats
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.teamStats],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.stats],
      });
      router.push(/app/management/training-attendance");
    },
  });
};

export const useTeamAttendanceAggregates = (
  teamId: number,
  seasonId: number,
  tenantId: string
) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [queryKeys.attendance.aggregates, teamId, seasonId],
    queryFn: () =>
      getTeamAttendanceAggregates(client, teamId, seasonId, tenantId),
  });
};

export const usePlayerAttendanceAggregates = (
  playerId: number,
  teamId: number,
  seasonId: number,
  tenantId: string
) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [queryKeys.attendance.aggregates, playerId, teamId, seasonId],
    queryFn: () =>
      getPlayerAttendanceAggregates(
        client,
        playerId,
        teamId,
        seasonId,
        tenantId
      ),
  });
};

export const useAllTeamPlayerAttendanceAggregates = (
  teamId: number,
  seasonId: number,
  tenantId: string
) => {
  const client = useSupabase();

  return useQuery({
    queryKey: [queryKeys.attendance.aggregates, "team", teamId, seasonId],
    queryFn: () =>
      getAllTeamPlayerAttendanceAggregates(client, teamId, seasonId, tenantId),
  });
};

export const useUpdateAttendanceStatuses = (
  sessionId: number,
  tenantId: string
) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      records: { playerId: number; status: AttendanceStatus | null }[]
    ) => {
      return updateOrCreateAttendanceRecords(
        client,
        sessionId,
        records,
        tenantId
      );
    },
    onSuccess: () => {
      // Invalidate session detail
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.detail(tenantId, sessionId.toString())],
      });

      // Invalidate specific records for this session
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.records, sessionId, tenantId],
      });

      // Invalidate active sessions carousel
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.activeSessions, tenantId],
      });

      // Invalidate any potential aggregated stats
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.stats],
      });
    },
  });
};
