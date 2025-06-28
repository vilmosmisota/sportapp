import { Badge } from "@/components/ui/badge";
import { getTenantPerformerName } from "@/entities/member/Member.utils";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { CheckCircle, Clock, UserX, Users, XCircle } from "lucide-react";
import {
  PerformerAttendanceRow,
  calculateAttendanceStats,
} from "../utils/transformAttendanceData";

interface AttendanceSummaryProps {
  attendanceRows: PerformerAttendanceRow[];
  tenant: Tenant;
}

export function AttendanceSummary({
  attendanceRows,
  tenant,
}: AttendanceSummaryProps) {
  const stats = calculateAttendanceStats(attendanceRows);
  const performerDisplayName = getTenantPerformerName(tenant);

  return (
    <div className="flex items-center justify-between h-9 px-4 rounded-sm border">
      {/* Left side - Total and attendance rate */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium">
            {stats.total} {performerDisplayName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Attendance:</span>
          <Badge
            variant={
              stats.attendanceRate >= 80
                ? "default"
                : stats.attendanceRate >= 60
                ? "secondary"
                : "destructive"
            }
          >
            {stats.attendanceRate}%
          </Badge>
        </div>
      </div>

      {/* Right side - Status breakdown */}
      <div className="flex items-center gap-3">
        {/* Present */}
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-xs font-medium text-green-700 dark:text-green-300">
            {stats.present}
          </span>
        </div>

        {/* Late */}
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
            {stats.late}
          </span>
        </div>

        {/* Absent */}
        <div className="flex items-center gap-1.5">
          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-xs font-medium text-red-700 dark:text-red-300">
            {stats.absent}
          </span>
        </div>

        {/* Not Checked In */}
        <div className="flex items-center gap-1.5">
          <UserX className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {stats.notCheckedIn}
          </span>
        </div>
      </div>
    </div>
  );
}
