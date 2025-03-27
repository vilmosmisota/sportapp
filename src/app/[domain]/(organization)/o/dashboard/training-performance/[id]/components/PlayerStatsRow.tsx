import { TableCell, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { usePlayerAttendanceAggregates } from "@/entities/attendance/Attendance.actions.client";

interface PlayerStatsRowProps {
  player: {
    id: number;
    firstName: string;
    lastName: string;
  };
  teamId: number;
  seasonId: number;
  tenantId: string;
}

export function PlayerStatsRow({
  player,
  teamId,
  seasonId,
  tenantId,
}: PlayerStatsRowProps) {
  const { data: stats } = usePlayerAttendanceAggregates(
    player.id,
    teamId,
    seasonId,
    tenantId
  );

  if (!stats) return null;

  const totalSessions = stats.totalOnTime + stats.totalLate + stats.totalAbsent;
  const attendanceRate = Math.round(
    ((stats.totalOnTime + stats.totalLate) / totalSessions) * 100
  );
  const accuracyRate = Math.round((stats.totalOnTime / totalSessions) * 100);

  return (
    <TableRow>
      <TableCell className="font-medium">
        {player.firstName} {player.lastName}
      </TableCell>
      <TableCell>{totalSessions}</TableCell>
      <TableCell>{stats.totalOnTime}</TableCell>
      <TableCell>{stats.totalLate}</TableCell>
      <TableCell>{stats.totalAbsent}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Progress
            value={attendanceRate}
            className="h-2 w-[60px] bg-emerald-50 [&>div]:bg-emerald-500"
          />
          <span>{attendanceRate}%</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Progress
            value={accuracyRate}
            className="h-2 w-[60px] bg-orange-50 [&>div]:bg-orange-200"
          />
          <span>{accuracyRate}%</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
