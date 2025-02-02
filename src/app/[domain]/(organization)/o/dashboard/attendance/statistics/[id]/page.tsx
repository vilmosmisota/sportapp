"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useTeamAttendanceAggregates,
  usePlayerAttendanceAggregates,
  useAllTeamPlayerAttendanceAggregates,
} from "@/entities/attendance/Attendance.actions.client";
import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatItem } from "../components/StatItem";
import {
  BarChart3,
  Users,
  Clock,
  Trophy,
  Calendar,
  ArrowLeft,
  ArrowUpDown,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import SeasonSelect from "../../../trainings/components/SeasonSelect";
import { AttendanceSessionAggregate } from "@/entities/attendance/Attendance.schema";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SessionData {
  sessionId: number;
  trainingId: number;
  date: string;
  startTime: string;
  endTime: string;
  presentCount: number;
  lateCount: number;
  absentCount: number;
}

interface TrendData {
  date: string;
  attendance: number;
  accuracy: number;
}

interface DayStats {
  day: string;
  attendance: number;
  accuracy: number;
}

function PlayerStatsRow({
  player,
  teamId,
  seasonId,
  tenantId,
}: {
  player: { id: number; firstName: string; lastName: string };
  teamId: number;
  seasonId: number;
  tenantId: string;
}) {
  const { data: stats } = usePlayerAttendanceAggregates(
    player.id,
    teamId,
    seasonId,
    tenantId
  );

  if (!stats) return null;

  const totalSessions =
    stats.totalAttendance + stats.totalLate + stats.totalAbsent;
  const attendanceRate = Math.round(
    ((stats.totalAttendance + stats.totalLate) / totalSessions) * 100
  );
  const accuracyRate = Math.round(
    (stats.totalAttendance / totalSessions) * 100
  );

  return (
    <TableRow>
      <TableCell className="font-medium">
        {player.firstName} {player.lastName}
      </TableCell>
      <TableCell>{totalSessions}</TableCell>
      <TableCell>{stats.totalAttendance}</TableCell>
      <TableCell>{stats.totalLate}</TableCell>
      <TableCell>{stats.totalAbsent}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Progress value={attendanceRate} className="h-2 w-[60px]" />
          <span>{attendanceRate}%</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Progress value={accuracyRate} className="h-2 w-[60px]" />
          <span>{accuracyRate}%</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

function PlayerRankingItem({
  player,
  teamId,
  seasonId,
  tenantId,
}: {
  player: { id: number; firstName: string; lastName: string };
  teamId: number;
  seasonId: number;
  tenantId: string;
}) {
  const { data: stats } = usePlayerAttendanceAggregates(
    player.id,
    teamId,
    seasonId,
    tenantId
  );

  if (!stats) return null;

  const attendanceRate = Math.round(
    (stats.totalAttendance /
      (stats.totalAttendance + stats.totalLate + stats.totalAbsent)) *
      100
  );

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <p className="font-medium">
          {player.firstName} {player.lastName}
        </p>
        <Progress value={attendanceRate} className="h-2" />
      </div>
      <Badge variant="secondary">{attendanceRate}%</Badge>
    </div>
  );
}

export default function TeamStatisticsDetailPage() {
  const params = useParams();
  const teamId = Number(params.id);
  const domain = params.domain as string;

  const { data: tenant } = useTenantByDomain(domain);
  const tenantId = tenant?.id?.toString() || "";
  const { data: teams } = useGetTeamsByTenantId(tenantId);
  const team = teams?.find((t) => t.id === teamId);
  const { data: seasons } = useSeasonsByTenantId(tenantId);
  const activeSeason = seasons?.find((s) => s.isActive) || null;
  const activeSeasonId = activeSeason?.id || 0;

  const {
    data: teamStats,
    isLoading: isTeamStatsLoading,
    isError: isTeamStatsError,
  } = useTeamAttendanceAggregates(teamId, activeSeasonId, tenantId);

  const {
    data: playerStats,
    isLoading: isPlayerStatsLoading,
    isError: isPlayerStatsError,
  } = useAllTeamPlayerAttendanceAggregates(teamId, activeSeasonId, tenantId);

  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Early return if required data is missing
  if (!tenantId || !activeSeasonId) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Missing required data</AlertDescription>
      </Alert>
    );
  }

  if (isTeamStatsLoading || isPlayerStatsLoading || !team) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
        </div>
      </div>
    );
  }

  if (isTeamStatsError || isPlayerStatsError || !teamStats) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load team statistics</AlertDescription>
      </Alert>
    );
  }

  const allSessions = (
    (teamStats.sessions || []) as unknown as SessionData[]
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate trend data for all sessions
  const trendData = allSessions.map((session) => {
    const totalAttendees =
      session.presentCount + session.lateCount + session.absentCount;
    return {
      date: format(new Date(session.date), "dd MMM"),
      attendance: Math.round(
        ((session.presentCount + session.lateCount) / totalAttendees) * 100
      ),
      accuracy: Math.round((session.presentCount / totalAttendees) * 100),
    };
  });

  // Calculate stats by day of week
  const dayStats = allSessions.reduce(
    (
      acc: Record<
        string,
        { total: number; present: number; late: number; absent: number }
      >,
      session
    ) => {
      const day = format(new Date(session.date), "EEE");
      if (!acc[day]) {
        acc[day] = { total: 0, present: 0, late: 0, absent: 0 };
      }
      acc[day].total++;
      acc[day].present += session.presentCount;
      acc[day].late += session.lateCount;
      acc[day].absent += session.absentCount;
      return acc;
    },
    {}
  );

  interface PlayerStat {
    player: {
      id: number;
      gender: string;
      firstName: string;
      lastName: string;
      position: string;
      dateOfBirth: string;
      pin?: string | null;
    };
    attendanceRate: number;
    accuracyRate: number;
    totalSessions: number;
  }

  // Calculate player rankings
  const playerRankings = (team.playerTeamConnections || [])
    .map((connection) => {
      if (!connection.player) return null;
      const player = connection.player;
      const stats = playerStats?.find((s) => s.playerId === player.id);
      if (!stats) return null;

      const totalSessions =
        stats.totalAttendance + stats.totalLate + stats.totalAbsent;
      const attendanceRate = stats.attendanceRate;
      const accuracyRate = (stats.totalAttendance / totalSessions) * 100;

      return {
        player,
        attendanceRate,
        accuracyRate,
        totalSessions,
      };
    })
    .filter((stat): stat is PlayerStat => stat !== null)
    .sort((a, b) => {
      // Sort by combined score (average of attendance and accuracy)
      const aScore = (a.attendanceRate + a.accuracyRate) / 2;
      const bScore = (b.attendanceRate + b.accuracyRate) / 2;
      return bScore - aScore;
    });

  const topPerformers = playerRankings.slice(0, 3);
  const worstPerformers = playerRankings.slice(-3).reverse();

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedPlayers = [...(team.playerTeamConnections || [])]
    .filter((connection) => connection.player)
    .sort((a, b) => {
      const playerA = a.player!;
      const playerB = b.player!;
      const statsA = playerStats?.find((s) => s.playerId === playerA.id);
      const statsB = playerStats?.find((s) => s.playerId === playerB.id);

      if (!statsA || !statsB) return 0;

      const totalSessionsA =
        statsA.totalAttendance + statsA.totalLate + statsA.totalAbsent;
      const totalSessionsB =
        statsB.totalAttendance + statsB.totalLate + statsB.totalAbsent;
      const attendanceRateA =
        ((statsA.totalAttendance + statsA.totalLate) / totalSessionsA) * 100;
      const attendanceRateB =
        ((statsB.totalAttendance + statsB.totalLate) / totalSessionsB) * 100;
      const accuracyRateA = (statsA.totalAttendance / totalSessionsA) * 100;
      const accuracyRateB = (statsB.totalAttendance / totalSessionsB) * 100;

      const multiplier = sortDirection === "asc" ? 1 : -1;

      switch (sortColumn) {
        case "name":
          return (
            multiplier *
            `${playerA.firstName} ${playerA.lastName}`.localeCompare(
              `${playerB.firstName} ${playerB.lastName}`
            )
          );
        case "totalSessions":
          return multiplier * (totalSessionsA - totalSessionsB);
        case "present":
          return multiplier * (statsA.totalAttendance - statsB.totalAttendance);
        case "late":
          return multiplier * (statsA.totalLate - statsB.totalLate);
        case "absent":
          return multiplier * (statsA.totalAbsent - statsB.totalAbsent);
        case "attendanceRate":
          return multiplier * (attendanceRateA - attendanceRateB);
        case "accuracyRate":
          return multiplier * (accuracyRateA - accuracyRateB);
        default:
          return 0;
      }
    });

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link href="../statistics">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Statistics
              </Button>
            </Link>
            <h2 className="text-2xl font-bold tracking-tight">
              {team?.name} Statistics
            </h2>
          </div>
          <SeasonSelect
            seasons={seasons || []}
            selectedSeason={activeSeason}
            tenantId={tenantId}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatItem
            icon={Users}
            label="Total Players"
            value={team?.playerTeamConnections?.length || 0}
          />
          <StatItem
            icon={Calendar}
            label="Total Sessions"
            value={teamStats.totalSessions}
          />
          <StatItem
            icon={Trophy}
            label="Average Attendance"
            value={`${Math.round(teamStats.averageAttendanceRate)}%`}
          />
          <StatItem
            icon={Clock}
            label="On-Time Rate"
            value={`${Math.round(
              (teamStats.totalPresent /
                (teamStats.totalPresent + teamStats.totalLate)) *
                100
            )}%`}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">
                  Attendance & Accuracy Trends
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  All sessions performance
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <ChartContainer
                  config={{
                    attendance: {
                      label: "Attendance Rate",
                      theme: {
                        light: "hsl(var(--emerald-500))",
                        dark: "hsl(var(--emerald-500))",
                      },
                    },
                    accuracy: {
                      label: "Accuracy Rate",
                      theme: {
                        light: "hsl(var(--sky-500))",
                        dark: "hsl(var(--sky-500))",
                      },
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={trendData}>
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <CartesianGrid
                        stroke="hsl(var(--border))"
                        strokeDasharray="4 4"
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="flex flex-col gap-2">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {payload[0].payload.date}
                                </span>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="font-bold">
                                      {payload[0].value}% Attendance
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-sky-500" />
                                    <span className="font-bold">
                                      {payload[1].value}% Accuracy
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        content={({ payload }) => {
                          if (!payload?.length) return null;
                          return (
                            <div className="flex justify-center gap-6">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-sm text-muted-foreground">
                                  Attendance Rate
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-sky-500" />
                                <span className="text-sm text-muted-foreground">
                                  Accuracy Rate
                                </span>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Line
                        name="Attendance Rate"
                        type="monotone"
                        dataKey="attendance"
                        stroke="rgb(16 185 129)"
                        strokeWidth={2}
                        dot={true}
                      />
                      <Line
                        name="Accuracy Rate"
                        type="monotone"
                        dataKey="accuracy"
                        stroke="rgb(14 165 233)"
                        strokeWidth={2}
                        dot={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">
                  Attendance & Accuracy by Day
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  All sessions performance
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <ChartContainer
                  config={{
                    attendance: {
                      label: "Attendance Rate",
                      theme: {
                        light: "hsl(var(--emerald-500))",
                        dark: "hsl(var(--emerald-500))",
                      },
                    },
                    accuracy: {
                      label: "Accuracy Rate",
                      theme: {
                        light: "hsl(var(--sky-500))",
                        dark: "hsl(var(--sky-500))",
                      },
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={Object.entries(dayStats).map(([day, stats]) => ({
                        day,
                        attendance: Math.round(
                          ((stats.present + stats.late) /
                            (stats.present + stats.late + stats.absent)) *
                            100
                        ),
                        accuracy: Math.round(
                          (stats.present /
                            (stats.present + stats.late + stats.absent)) *
                            100
                        ),
                      }))}
                    >
                      <XAxis
                        dataKey="day"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <CartesianGrid
                        stroke="hsl(var(--border))"
                        strokeDasharray="4 4"
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="flex flex-col gap-2">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {payload[0].payload.day}
                                </span>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="font-bold">
                                      {payload[0].value}% Attendance
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-sky-500" />
                                    <span className="font-bold">
                                      {payload[1].value}% Accuracy
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        content={({ payload }) => {
                          if (!payload?.length) return null;
                          return (
                            <div className="flex justify-center gap-6">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-sm text-muted-foreground">
                                  Attendance Rate
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-sky-500" />
                                <span className="text-sm text-muted-foreground">
                                  Accuracy Rate
                                </span>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Bar
                        dataKey="attendance"
                        name="Attendance Rate"
                        fill="rgb(16 185 129)"
                      />
                      <Bar
                        dataKey="accuracy"
                        name="Accuracy Rate"
                        fill="rgb(14 165 233)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                Performance Overview
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Top and bottom performers based on attendance rate
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Players with best overall performance
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {topPerformers.map((stat, index) => (
                    <div key={stat.player.id} className="relative">
                      {index === 0 &&
                        topPerformers.length > 1 &&
                        (stat.attendanceRate + stat.accuracyRate) / 2 >
                          (topPerformers[1].attendanceRate +
                            topPerformers[1].accuracyRate) /
                            2 && (
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                          </div>
                        )}
                      <div className="pl-4">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-medium">
                            {stat.player.firstName} {stat.player.lastName}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-700"
                            >
                              {Math.round(stat.attendanceRate)}%
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-sky-100 text-sky-700"
                            >
                              {Math.round(stat.accuracyRate)}%
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">
                                Attendance
                              </span>
                              <span className="text-xs text-emerald-600">
                                {Math.round(stat.attendanceRate)}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 transition-all"
                                style={{ width: `${stat.attendanceRate}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">
                                Accuracy
                              </span>
                              <span className="text-xs text-sky-600">
                                {Math.round(stat.accuracyRate)}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-sky-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-sky-500 transition-all"
                                style={{ width: `${stat.accuracyRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {stat.totalSessions} sessions attended
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Needs Improvement</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Players with lowest overall performance
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {worstPerformers.map((stat) => (
                    <div key={stat.player.id}>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-medium">
                          {stat.player.firstName} {stat.player.lastName}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-rose-50 text-rose-600"
                          >
                            {Math.round(stat.attendanceRate)}%
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-orange-50 text-orange-600"
                          >
                            {Math.round(stat.accuracyRate)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              Attendance
                            </span>
                            <span className="text-xs text-rose-500">
                              {Math.round(stat.attendanceRate)}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-rose-50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rose-200 transition-all"
                              style={{ width: `${stat.attendanceRate}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              Accuracy
                            </span>
                            <span className="text-xs text-orange-500">
                              {Math.round(stat.accuracyRate)}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-orange-50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-200 transition-all"
                              style={{ width: `${stat.accuracyRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {stat.totalSessions} sessions attended
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Player Attendance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="group/header">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 data-[state=open]:bg-accent flex items-center gap-2"
                          >
                            Player
                            <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover/header:opacity-100" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => handleSort("name")}>
                            Asc
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSort("name")}>
                            Desc
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSort("")}>
                            Clear
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    <TableHead className="group/header">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 data-[state=open]:bg-accent flex items-center gap-2"
                          >
                            Total Sessions
                            <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover/header:opacity-100" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() => handleSort("totalSessions")}
                          >
                            Asc
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSort("totalSessions")}
                          >
                            Desc
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSort("")}>
                            Clear
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    <TableHead className="group/header">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 data-[state=open]:bg-accent flex items-center gap-2"
                          >
                            Present
                            <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover/header:opacity-100" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() => handleSort("present")}
                          >
                            Asc
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSort("present")}
                          >
                            Desc
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSort("")}>
                            Clear
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    <TableHead className="group/header">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 data-[state=open]:bg-accent flex items-center gap-2"
                          >
                            Late
                            <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover/header:opacity-100" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => handleSort("late")}>
                            Asc
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSort("late")}>
                            Desc
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSort("")}>
                            Clear
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    <TableHead className="group/header">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 data-[state=open]:bg-accent flex items-center gap-2"
                          >
                            Absent
                            <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover/header:opacity-100" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() => handleSort("absent")}
                          >
                            Asc
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSort("absent")}
                          >
                            Desc
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSort("")}>
                            Clear
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    <TableHead className="group/header">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 data-[state=open]:bg-accent flex items-center gap-2"
                          >
                            Attendance Rate
                            <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover/header:opacity-100" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() => handleSort("attendanceRate")}
                          >
                            Asc
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSort("attendanceRate")}
                          >
                            Desc
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSort("")}>
                            Clear
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    <TableHead className="group/header">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 data-[state=open]:bg-accent flex items-center gap-2"
                          >
                            Accuracy Rate
                            <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover/header:opacity-100" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() => handleSort("accuracyRate")}
                          >
                            Asc
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSort("accuracyRate")}
                          >
                            Desc
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSort("")}>
                            Clear
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPlayers.map((connection) => (
                    <PlayerStatsRow
                      key={connection.player!.id}
                      player={connection.player!}
                      teamId={teamId}
                      seasonId={activeSeasonId}
                      tenantId={tenantId}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
