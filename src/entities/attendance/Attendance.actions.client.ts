import { TypedClient } from "@/libs/supabase/type";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAttendanceSession,
  updateAttendanceSession,
} from "./Attendance.services";
import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { createAttendanceRecord } from "./Attendance.services";

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
    mutationFn: async ({ playerId }: { playerId: number }) =>
      createAttendanceRecord(
        client,
        {
          attendanceSessionId: sessionId,
          playerId,
          tenantId: Number(tenantId),
          status: "present",
          checkInTime: null,
          isLate: null,
        },
        tenantId
      ),
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
    }: {
      sessionId: number;
      tenantId: string;
    }) => {
      const currentTime = new Date();
      const formattedCurrentTime = currentTime.toLocaleTimeString("en-GB", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const session = await updateAttendanceSession(
        client,
        sessionId,
        {
          isActive: false,
          endTime: formattedCurrentTime,
        },
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
    },
  });
};
