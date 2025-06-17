import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { getActiveAttendanceSessions } from "./ActiveAttendanceSession.service";

/**
 * Hook to fetch active attendance sessions for a tenant
 */
export const useActiveAttendanceSessions = (tenantId?: string) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.attendance.activeSessions(tenantId),
    queryFn: async () => {
      if (!tenantId) return [];
      return getActiveAttendanceSessions(client, tenantId);
    },
    enabled: !!tenantId,
  });
};
