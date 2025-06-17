"use client";

import { useParams } from "next/navigation";
import { Calendar, Users, BarChart3, Trophy } from "lucide-react";

import { useGetTeamsByTenantId } from "@/entities/group/Group.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { useAllTeamPlayerAttendanceAggregates } from "@/entities/old-attendance/Attendance.actions.client";
import { AttendanceCharts } from "./components/AttendanceCharts";
import { PerformanceOverview } from "./components/PerformanceOverview";
import { AttendanceTable } from "./components/AttendanceTable";
import SeasonSelect from "@/components/calendar/SeasonSelect";
import { PageHeader } from "@/components/ui/page-header";
import {
  AttendanceRecordAggregate,
  AttendanceStatus,
} from "@/entities/old-attendance/Attendance.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Team,
  PlayerTeamConnectionSchema,
  getDisplayAgeGroup,
  getDisplayGender,
} from "@/entities/group/Group.schema";
import {
  calculateAttendanceRate,
  calculateAccuracyRate,
} from "@/entities/old-attendance/Attendance.utils";
import { useTeamAttendanceAggregates } from "@/entities/old-attendance/Attendance.actions.client";

function formatTeamName(team: {
  name?: string | null | undefined;
  age?: string | null | undefined;
  gender?: string | null | undefined;
  skill?: string | null | undefined;
}) {
  if (team.name) return team.name;

  return [
    getDisplayAgeGroup(team.age ?? null),
    getDisplayGender(team.gender ?? null, team.age ?? null),
    team.skill ?? null,
  ]
    .filter(Boolean)
    .join(" • ");
}

function StatItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: any;
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeamAttendanceStatisticsPage() {
  const params = useParams();
  const domain = params?.domain as string;
  const teamId = params?.id ? parseInt(params.id as string) : 0;
  const { data: tenant, isLoading: tenantLoading } = useTenantByDomain(domain);
  const { data: seasons, isLoading: isSeasonsLoading } = useSeasonsByTenantId(
    tenant?.id?.toString() || ""
  );
  const { data: teams, isLoading: teamsLoading } = useGetTeamsByTenantId(
    tenant?.id?.toString() || ""
  );
  const team = teams?.find((t) => t.id === teamId);
  const currentSeason = seasons?.find((s) => s.isActive);

  if (tenantLoading || isSeasonsLoading || teamsLoading) {
    return (
      <div className="space-y-6" data-testid="team-statistics-loading">
        <div className="space-y-2">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </Card>
            ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-40 w-full" />
          </Card>
          <Card className="p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-40 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (!tenant || !team || !currentSeason) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Team Attendance Statistics"
          backButton={{
            href: /management/training-analytics",
            label: "Back to Statistics",
          }}
        />
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
        team={team}
      />
    </ErrorBoundary>
  );
}

function TeamAttendanceStatisticsContent({
  teamId,
  seasonId,
  tenantId,
  team,
}: {
  teamId: number;
  seasonId: number;
  tenantId: string;
  team: Team;
}) {
  const { data: seasons } = useSeasonsByTenantId(tenantId);
  const { data: playerStats } = useAllTeamPlayerAttendanceAggregates(
    teamId,
    seasonId,
    tenantId
  );
  const { data: teamStats } = useTeamAttendanceAggregates(
    teamId,
    seasonId,
    tenantId
  );
  const selectedSeason = seasons?.find((s) => s.id === seasonId) || null;

  if (!playerStats) {
    return (
      <div className="space-y-4" data-testid="team-statistics-loading">
        <PageHeader
          title={formatTeamName(team)}
          description="View detailed attendance statistics for this team"
          backButton={{
            href: /management/training-analytics",
            label: "Back to Statistics",
          }}
        />
        <Alert>
          <AlertDescription>
            No attendance data available for this team yet. Start taking
            attendance to see statistics.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get all sessions from team stats
  const allSessions = teamStats?.sessions
    ? (
        teamStats.sessions as {
          date: string;
          sessionId: number;
          trainingId: number;
          startTime: string;
          endTime: string;
          onTimeCount: number;
          lateCount: number;
          absentCount: number;
        }[]
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  // Format trend data for the line chart using the same approach as the main page
  const chartData = allSessions.map((session) => {
    const sessionDate = new Date(session.date);
    // Calculate attendance rate using the utility function
    const attendanceRate = calculateAttendanceRate(
      session.onTimeCount,
      session.lateCount,
      session.absentCount
    );

    // Calculate accuracy rate using the utility function
    const accuracyRate = calculateAccuracyRate(
      session.onTimeCount,
      session.lateCount
    );

    return {
      date: format(sessionDate, "MMM d"),
      attendance: attendanceRate,
      accuracy: accuracyRate,
    };
  });

  // Calculate day of week stats from all sessions
  const dayOfWeekStats = allSessions.reduce(
    (
      acc: Record<
        string,
        {
          day: string;
          onTime: number;
          late: number;
          absent: number;
          total: number;
        }
      >,
      session
    ) => {
      const sessionDate = new Date(session.date);
      const day = format(sessionDate, "EEEE");
      if (!acc[day]) {
        acc[day] = {
          day,
          onTime: 0,
          late: 0,
          absent: 0,
          total: 0,
        };
      }

      // Count all players for this session
      const sessionTotal =
        session.onTimeCount + session.lateCount + session.absentCount;
      acc[day].total += sessionTotal;

      // Add stats for this session to the day's stats
      acc[day].onTime += session.onTimeCount;
      acc[day].late += session.lateCount;
      acc[day].absent += session.absentCount;

      return acc;
    },
    {}
  );

  // Sort day stats for consistent display order (e.g., Mon, Tue, Wed, etc.)
  const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const dayStatsData = Object.entries(dayOfWeekStats)
    .sort(([a], [b]) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
    .map(([day, data]) => {
      // Calculate attendance rate using the utility function
      const attendanceRate = calculateAttendanceRate(
        data.onTime,
        data.late,
        data.absent
      );

      // Calculate accuracy rate using utility function
      const accuracyRate = calculateAccuracyRate(data.onTime, data.late);

      return {
        day,
        attendance: attendanceRate,
        accuracy: accuracyRate,
      };
    });

  // Process data for performance overview
  const playerPerformance = playerStats
    .map((stats) => {
      const totalSessions =
        stats.totalOnTime + stats.totalLate + stats.totalAbsent;

      // Calculate the new Attendance Performance Score
      const attendancePerformanceScore =
        ((stats.totalOnTime * 1.0 +
          stats.totalLate * 0.5 -
          stats.totalAbsent * 0.25) /
          totalSessions) *
        100;

      // Ensure score is not negative and round to nearest integer
      const performanceScore = Math.max(
        0,
        Math.round(attendancePerformanceScore)
      );

      // Keep the original metrics for backward compatibility
      const attendanceRate = Math.round(
        ((stats.totalOnTime + stats.totalLate) / totalSessions) * 100
      );
      const accuracyRate = calculateAccuracyRate(
        stats.totalOnTime,
        stats.totalLate
      );

      const playerConnection = team.playerTeamConnections?.find(
        (p: typeof PlayerTeamConnectionSchema._type) =>
          p.player?.id === stats.playerId
      );
      if (!playerConnection?.player) return null;

      return {
        id: stats.playerId.toString(),
        name: `${playerConnection.player.firstName} ${playerConnection.player.lastName}`,
        attendanceRate,
        accuracyRate,
        performanceScore,
        // Include raw data for context
        onTime: stats.totalOnTime,
        late: stats.totalLate,
        absent: stats.totalAbsent,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  // Sort by the single performance score
  const sortedPerformance = [...playerPerformance].sort(
    (a, b) => b.performanceScore - a.performanceScore
  );

  const topPerformers = sortedPerformance.slice(0, 3);
  const bottomPerformers = sortedPerformance.slice(-3).reverse();

  // Calculate overall statistics
  const totalSessions = playerStats.reduce((acc, player) => {
    const playerSessions =
      player.totalOnTime + player.totalLate + player.totalAbsent;
    return Math.max(acc, playerSessions);
  }, 0);

  const totalPlayers = team.playerTeamConnections?.length || 0;

  const overallStats = playerStats.reduce(
    (acc, player) => {
      acc.totalOnTime += player.totalOnTime;
      acc.totalLate += player.totalLate;
      acc.totalAbsent += player.totalAbsent;
      return acc;
    },
    { totalOnTime: 0, totalLate: 0, totalAbsent: 0 }
  );

  const totalAttendances =
    overallStats.totalOnTime +
    overallStats.totalLate +
    overallStats.totalAbsent;

  const attendanceRate =
    ((overallStats.totalOnTime + overallStats.totalLate) / totalAttendances) *
    100;

  const onTimeRate =
    (overallStats.totalOnTime /
      (overallStats.totalOnTime + overallStats.totalLate)) *
    100;

  return (
    <div className="space-y-6">
      <PageHeader
        title={formatTeamName(team)}
        description={`Attendance statistics for ${
          selectedSeason?.customName ?? "current season"
        }`}
        backButton={{
          href: /management/training-analytics",
          label: "Back to Statistics",
        }}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem
          icon={Calendar}
          label="Training Sessions"
          value={totalSessions}
        />
        <StatItem icon={Users} label="Players" value={totalPlayers} />
        <StatItem
          icon={BarChart3}
          label="Attendance Rate"
          value={`${Math.round(attendanceRate)}%`}
        />
        <StatItem
          icon={Trophy}
          label="On-Time Rate"
          value={`${Math.round(onTimeRate)}%`}
        />
      </div>

      <AttendanceCharts
        trendData={chartData}
        dayStats={dayStatsData}
        data-testid="attendance-charts"
      />

      <PerformanceOverview
        topPerformers={topPerformers}
        bottomPerformers={bottomPerformers}
        data-testid="performance-overview"
      />

      <AttendanceTable
        players={team.playerTeamConnections || []}
        playerStats={playerStats}
        teamId={teamId}
        seasonId={seasonId}
        tenantId={tenantId}
        data-testid="attendance-table"
      />
    </div>
  );
}
