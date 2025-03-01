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
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.all,
      });
      router.push(`/o/dashboard/attendance/${data.id}`);
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
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.records],
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
    onSuccess: () => {
      // Since the records are now deleted, we need to invalidate different queries

      // Invalidate active sessions
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.activeSessions,
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
        queryKey: [queryKeys.attendance.sessions],
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.all,
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.teamStats],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.stats],
      });
      router.push("/o/dashboard/attendance");
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
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.detail(tenantId, sessionId.toString())],
      });

      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.records, sessionId, tenantId],
      });
    },
  });
};
