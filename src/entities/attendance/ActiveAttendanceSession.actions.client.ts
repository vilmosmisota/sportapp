import { queryKeys } from "@/cacheKeys/cacheKeys";
import { SessionWithGroup } from "@/entities/session/Session.schema";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  closeActiveAttendanceSession,
  createActiveAttendanceSession,
} from "./ActiveAttendanceSession.service";

/**
 * Hook to create a new active attendance session
 */
export const useCreateActiveAttendanceSession = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      session,
      tenantId,
    }: {
      session: SessionWithGroup;
      tenantId: string;
    }) => {
      return createActiveAttendanceSession(client, {
        sessionId: session.id,
        seasonId: session.seasonId,
        tenantId,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.activeSessions(variables.tenantId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.all,
      });
    },
    onError: (error) => {
      console.error("Error creating active attendance session:", error);
    },
  });
};

/**
 * Hook to close an active attendance session
 */
export const useCloseActiveAttendanceSession = () => {
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
      return closeActiveAttendanceSession(client, sessionId, tenantId);
    },
    onSuccess: (_, variables) => {
      // Invalidate active sessions query to update the UI
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.activeSessions(variables.tenantId),
      });

      // Invalidate all attendance data
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.all,
      });
    },
    onError: (error) => {
      console.error("Error closing active attendance session:", error);
    },
  });
};
