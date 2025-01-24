import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import {
  getActiveAttendanceSessions,
  getAttendanceSessions,
  getAttendanceRecords,
  getAttendanceSessionById,
  getTeamPlayerAttendanceStats,
  getTeamAttendanceStats,
} from "./Attendance.services";
import { TeamAttendanceStats } from "./Attendance.schema";

// Query for getting all attendance sessions
export const useAttendanceSessions = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.attendance.sessions, tenantId];

  return useQuery({
    queryKey,
    queryFn: () => getAttendanceSessions(client, tenantId),
    enabled: !!tenantId,
  });
};

// Query for getting active attendance sessions
export const useActiveAttendanceSessions = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.attendance.activeSessions, tenantId];

  return useQuery({
    queryKey,
    queryFn: () => getActiveAttendanceSessions(client, tenantId),
    enabled: !!tenantId,
  });
};

// Query for getting a single attendance session
export const useAttendanceSessionById = (
  sessionId: string,
  tenantId: string
) => {
  const client = useSupabase();
  const queryKey = [queryKeys.attendance.detail(tenantId, sessionId)];

  return useQuery({
    queryKey,
    queryFn: () =>
      getAttendanceSessionById(client, Number(sessionId), tenantId),
    enabled: !!sessionId && !!tenantId,
  });
};

// Query for getting attendance records for a session
export const useAttendanceRecords = (sessionId: number, tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.attendance.records, sessionId, tenantId];

  return useQuery({
    queryKey,
    queryFn: () => getAttendanceRecords(client, sessionId, tenantId),
    enabled: !!sessionId && !!tenantId,
  });
};

// Query for getting team player attendance statistics
export const useTeamPlayerAttendanceStats = (
  teamId: number,
  tenantId: string
) => {
  const client = useSupabase();
  const queryKey = [queryKeys.attendance.stats(tenantId, teamId)];

  return useQuery({
    queryKey,
    queryFn: () => getTeamPlayerAttendanceStats(client, teamId, tenantId),
    enabled: !!teamId && !!tenantId,
  });
};

// Query for getting team attendance statistics
export const useTeamAttendanceStats = (
  teamId: number,
  tenantId: string,
  seasonId?: string
) => {
  const client = useSupabase();
  const queryKey = [queryKeys.attendance.teamStats(tenantId, teamId), seasonId];

  return useQuery<TeamAttendanceStats>({
    queryKey,
    queryFn: () => getTeamAttendanceStats(client, teamId, tenantId, seasonId),
    enabled: !!teamId && !!tenantId,
  });
};
