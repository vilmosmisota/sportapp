import { TypedClient } from "@/libs/supabase/type";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAttendanceSession,
  updateAttendanceSession,
  getAttendanceSessionById,
  restoreAttendanceRecords,
  createAbsentRecords,
  deleteAttendanceSession,
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
      const currentTime = new Date();
      const formattedCurrentTime = currentTime.toLocaleTimeString("en-GB", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // First update the session status
      const session = await updateAttendanceSession(
        client,
        sessionId,
        {
          isActive: false,
          endTime: formattedCurrentTime,
        },
        tenantId
      );

      // Then update all pending records to absent and create new absent records
      await createAbsentRecords(
        client,
        sessionId,
        notCheckedInPlayerIds,
        tenantId
      );

      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.activeSessions,
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.records],
      });
    },
  });
};

export const useReopenAttendanceSession = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      tenantId,
    }: {
      sessionId: number;
      tenantId: string;
    }) => {
      // Update the session to be active again
      const session = await updateAttendanceSession(
        client,
        sessionId,
        {
          isActive: true,
          endTime: null,
        },
        tenantId
      );

      // Restore attendance records to their previous state
      await restoreAttendanceRecords(client, sessionId);

      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.activeSessions,
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.attendance.records],
      });
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
