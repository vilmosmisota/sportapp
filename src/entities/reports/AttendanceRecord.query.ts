import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { getAttendanceRecordAggregatesByGroup } from "./AttendanceRecord.services";

export const useAttendanceRecordAggregatesByGroup = (
  tenantId: number,
  groupId: number,
  seasonId?: number,
  enabled = true
) => {
  const client = useSupabase();

  return useQuery({
    queryKey: [
      "attendanceRecords",
      "recordAggregates",
      "byGroup",
      tenantId,
      groupId,
      seasonId,
    ],
    queryFn: () =>
      getAttendanceRecordAggregatesByGroup(client, tenantId, groupId, seasonId),
    enabled: enabled && !!tenantId && !!groupId,
  });
};
