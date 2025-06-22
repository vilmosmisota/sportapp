import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import {
  getAttendanceSessionAggregatesByGroup,
  getAttendanceSessionAggregatesBySeason,
} from "./AttendanceReport.services";

export const useAttendanceSessionAggregatesBySeason = (
  tenantId: number,
  seasonId: number,
  enabled = true
) => {
  const client = useSupabase();

  return useQuery({
    queryKey: ["attendanceReports", "sessionAggregates", tenantId, seasonId],
    queryFn: () =>
      getAttendanceSessionAggregatesBySeason(client, tenantId, seasonId),
    enabled: enabled && !!tenantId && !!seasonId,
  });
};

export const useAttendanceSessionAggregatesByGroup = (
  tenantId: number,
  groupId: number,
  seasonId: number,
  enabled = true
) => {
  const client = useSupabase();

  return useQuery({
    queryKey: [
      "attendanceReports",
      "sessionAggregates",
      "byGroup",
      tenantId,
      groupId,
      seasonId,
    ],
    queryFn: () =>
      getAttendanceSessionAggregatesByGroup(
        client,
        tenantId,
        groupId,
        seasonId
      ),
    enabled: enabled && !!tenantId && !!groupId && !!seasonId,
  });
};
