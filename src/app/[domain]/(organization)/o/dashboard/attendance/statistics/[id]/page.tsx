"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, BarChart3, Trophy } from "lucide-react";
import Link from "next/link";
import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { useAllTeamPlayerAttendanceAggregates } from "@/entities/attendance/Attendance.actions.client";
import { AttendanceCharts } from "./components/AttendanceCharts";
import { PerformanceOverview } from "./components/PerformanceOverview";
import { AttendanceTable } from "./components/AttendanceTable";
import SeasonSelect from "../../../trainings/components/SeasonSelect";
import {
  AttendanceRecordAggregate,
  AttendanceStatus,
} from "@/entities/attendance/Attendance.schema";
import { Card } from "@/components/ui/card";

export default function TeamAttendanceStatisticsPage() {
  const params = useParams<{ domain: string; id: string }>();
  const teamId = Number(params.id);
  const { data: tenant, isLoading: isTenantLoading } = useTenantByDomain(
    params.domain
  );
  const { data: seasons, isLoading: isSeasonsLoading } = useSeasonsByTenantId(
    tenant?.id?.toString() || ""
  );
  const { data: teams, isLoading: isTeamsLoading } = useGetTeamsByTenantId(
    tenant?.id?.toString() || ""
  );
  const team = teams?.find((t) => t.id === teamId);
  const currentSeason = seasons?.find((s) => s.isActive);

  const isLoading = isTenantLoading || isSeasonsLoading || isTeamsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/o/dashboard/attendance">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Team Attendance Statistics</h1>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
          <Skeleton className="h-[500px]" />
        </div>
      </div>
    );
  }

  if (!tenant || !team || !currentSeason) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/o/dashboard/attendance">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Team Attendance Statistics</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {!tenant
              ? "Tenant not found"
              : !team
              ? "Team not found"
              : "Current season not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <TeamAttendanceStatisticsContent
        teamId={teamId}
        seasonId={currentSeason.id}
        tenantId={tenant.id.toString()}
      />
    </ErrorBoundary>
  );
}

function TeamAttendanceStatisticsContent({
  teamId,
  seasonId,
  tenantId,
}: {
  teamId: number;
  seasonId: number;
  tenantId: string;
}) {
  const { data: teams } = useGetTeamsByTenantId(tenantId);
  const { data: seasons } = useSeasonsByTenantId(tenantId);
  const { data: playerStats } = useAllTeamPlayerAttendanceAggregates(
    teamId,
    seasonId,
    tenantId
  );
  const team = teams?.find((t) => t.id === teamId);
  const selectedSeason = seasons?.find((s) => s.id === seasonId) || null;

  if (!team || !playerStats) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/o/dashboard/attendance">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Team Attendance Statistics</h1>
        </div>
        <Alert>
          <AlertDescription>
            {!team
              ? "Team not found"
              : "No attendance data available for this team yet. Start taking attendance to see statistics."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Process data for charts
  const trendData = (playerStats as AttendanceRecordAggregate[]).reduce<
    Record<string, { date: string; attendance: number; accuracy: number }>
  >((acc, player) => {
    if (!player.records) return acc;

    player.records.forEach((record) => {
      const date = format(new Date(record.date), "MMM d");
      if (!acc[date]) {
        acc[date] = {
          date,
          attendance: 0,
          accuracy: 0,
        };
      }

      const isPresent = record.status === AttendanceStatus.PRESENT;
      const isLate = record.status === AttendanceStatus.LATE;

      if (isPresent || isLate) {
        acc[date].attendance++;
      }
      if (isPresent) {
        acc[date].accuracy++;
      }
    });
    return acc;
  }, {});

  const chartData = Object.values(trendData).map((data) => ({
    ...data,
    attendance: Math.round((data.attendance / playerStats.length) * 100),
    accuracy: Math.round((data.accuracy / playerStats.length) * 100),
  }));

  // Process data for day stats
  const dayStats = (playerStats as AttendanceRecordAggregate[]).reduce<
    Record<string, { day: string; attendance: number; accuracy: number }>
  >((acc, player) => {
    if (!player.records) return acc;

    player.records.forEach((record) => {
      const day = format(new Date(record.date), "EEEE");
      if (!acc[day]) {
        acc[day] = {
          day,
          attendance: 0,
          accuracy: 0,
        };
      }

      const isPresent = record.status === AttendanceStatus.PRESENT;
      const isLate = record.status === AttendanceStatus.LATE;

      if (isPresent || isLate) {
        acc[day].attendance++;
      }
      if (isPresent) {
        acc[day].accuracy++;
      }
    });
    return acc;
  }, {});

  const dayStatsData = Object.values(dayStats).map((data) => ({
    ...data,
    attendance: Math.round((data.attendance / playerStats.length) * 100),
    accuracy: Math.round((data.accuracy / playerStats.length) * 100),
  }));

  // Process data for performance overview
  const playerPerformance = playerStats
    .map((stats) => {
      const totalSessions =
        stats.totalAttendance + stats.totalLate + stats.totalAbsent;
      const attendanceRate = Math.round(
        ((stats.totalAttendance + stats.totalLate) / totalSessions) * 100
      );
      const accuracyRate = Math.round(
        (stats.totalAttendance / totalSessions) * 100
      );

      const playerConnection = team.playerTeamConnections?.find(
        (p) => p.player?.id === stats.playerId
      );
      if (!playerConnection?.player) return null;

      return {
        id: stats.playerId.toString(),
        name: `${playerConnection.player.firstName} ${playerConnection.player.lastName}`,
        attendanceRate,
        accuracyRate,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const sortedPerformance = [...playerPerformance].sort(
    (a, b) =>
      b.attendanceRate + b.accuracyRate - (a.attendanceRate + a.accuracyRate)
  );

  const topPerformers = sortedPerformance.slice(0, 3);
  const bottomPerformers = sortedPerformance.slice(-3).reverse();

  // Calculate overall statistics
  const totalSessions = playerStats.reduce((acc, player) => {
    const playerSessions =
      player.totalAttendance + player.totalLate + player.totalAbsent;
    return Math.max(acc, playerSessions);
  }, 0);

  const totalPlayers = team.playerTeamConnections?.length || 0;

  const overallStats = playerStats.reduce(
    (acc, player) => {
      acc.totalPresent += player.totalAttendance;
      acc.totalLate += player.totalLate;
      acc.totalAbsent += player.totalAbsent;
      return acc;
    },
    { totalPresent: 0, totalLate: 0, totalAbsent: 0 }
  );

  const totalAttendances =
    overallStats.totalPresent +
    overallStats.totalLate +
    overallStats.totalAbsent;
  const attendanceRate = Math.round(
    ((overallStats.totalPresent + overallStats.totalLate) / totalAttendances) *
      100
  );
  const accuracyRate = Math.round(
    (overallStats.totalPresent / totalAttendances) * 100
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/o/dashboard/attendance/statistics">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Team Attendance Statistics</h1>
        </div>
        <SeasonSelect
          seasons={seasons || []}
          selectedSeason={selectedSeason}
          tenantId={tenantId}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                Total Sessions
              </span>
              <span className="text-2xl font-bold">{totalSessions}</span>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                Total Players
              </span>
              <span className="text-2xl font-bold">{totalPlayers}</span>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                Attendance Rate
              </span>
              <span className="text-2xl font-bold">{attendanceRate}%</span>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                Accuracy Rate
              </span>
              <span className="text-2xl font-bold">{accuracyRate}%</span>
            </div>
          </div>
        </Card>
      </div>

      <AttendanceCharts trendData={chartData} dayStats={dayStatsData} />
      <PerformanceOverview
        topPerformers={topPerformers}
        bottomPerformers={bottomPerformers}
      />
      <AttendanceTable
        players={team.playerTeamConnections || []}
        playerStats={playerStats}
        teamId={teamId}
        seasonId={seasonId}
        tenantId={tenantId}
      />
    </div>
  );
}
