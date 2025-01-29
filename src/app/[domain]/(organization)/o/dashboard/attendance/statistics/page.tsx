"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Clock, Trophy, Calendar } from "lucide-react";
import Link from "next/link";
import { getDisplayGender } from "@/entities/team/Team.schema";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useTeamAttendanceAggregates } from "@/entities/attendance/Attendance.actions.client";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  Tooltip,
  Legend,
} from "recharts";
import SeasonSelect from "../../trainings/components/SeasonSelect";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { AttendanceSessionAggregate } from "@/entities/attendance/Attendance.schema";

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

type SessionData = {
  sessionId: number;
  trainingId: number;
  date: string;
  startTime: string;
  endTime: string;
  presentCount: number;
  lateCount: number;
  absentCount: number;
};

type DayStats = {
  total: number;
  present: number;
  late: number;
  absent: number;
};

function TeamCard({
  team,
  tenantId,
  seasonId,
}: {
  team: {
    id: number;
    name: string | null;
    age: string | null;
    gender: string | null;
    skill: string | null;
    playerTeamConnections?: Array<{ player: { id: number } | null }>;
    coach?: {
      firstName: string | null;
      lastName: string | null;
    } | null;
  };
  tenantId: string;
  seasonId?: string;
}) {
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError,
  } = useTeamAttendanceAggregates(team.id, Number(seasonId), tenantId);

  if (isStatsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-lg">
            {team.name ||
              [team.age, getDisplayGender(team.gender, team.age), team.skill]
                .filter(Boolean)
                .join(" • ")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>Failed to load team statistics</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const hasStats = stats && stats.totalSessions > 0;

  // Get the last 10 sessions for recent stats
  const recentSessions = stats?.sessions
    ? (stats.sessions as SessionData[])
        .slice(0, 10)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  // Format recent trend data for the line chart
  const recentTrendData = recentSessions.map((session) => {
    const totalAttendees =
      session.presentCount + session.lateCount + session.absentCount;
    const attendanceRate = Math.round(
      ((session.presentCount + session.lateCount) / totalAttendees) * 100
    );
    const accuracyRate = Math.round(
      (session.presentCount / totalAttendees) * 100
    );

    return {
      date: session.date,
      dateFormatted: format(new Date(session.date), "dd MMM yyyy"),
      attendance: attendanceRate,
      accuracy: accuracyRate,
    };
  });

  // Calculate recent stats
  const recentStats = recentSessions.reduce(
    (acc, session) => {
      acc.totalPresent += session.presentCount;
      acc.totalLate += session.lateCount;
      acc.totalAbsent += session.absentCount;
      acc.totalPlayers +=
        session.presentCount + session.lateCount + session.absentCount;
      acc.sessions++;
      return acc;
    },
    {
      totalPresent: 0,
      totalLate: 0,
      totalAbsent: 0,
      totalPlayers: 0,
      sessions: 0,
    }
  );

  const recentAttendanceRate = Math.round(
    ((recentStats.totalPresent + recentStats.totalLate) /
      recentStats.totalPlayers) *
      100
  );

  const recentAveragePlayers = Math.round(
    recentStats.totalPlayers / recentStats.sessions
  );

  // Calculate day of week stats from recent sessions
  const dayOfWeekStats = recentSessions.reduce(
    (acc: Record<string, DayStats>, session) => {
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

  const dayOfWeekData = Object.entries(dayOfWeekStats).map(([day, data]) => ({
    day,
    attendance: Math.round(
      ((data.present + data.late) / (data.present + data.late + data.absent)) *
        100
    ),
    accuracy: Math.round(
      (data.present / (data.present + data.late + data.absent)) * 100
    ),
  }));

  // Calculate consecutive full attendance from recent sessions
  const consecutiveFullAttendance = recentSessions.reduce(
    (acc: { current: number; max: number }, session) => {
      const isFullAttendance =
        session.absentCount === 0 && session.lateCount === 0;
      if (isFullAttendance) {
        acc.current++;
        acc.max = Math.max(acc.max, acc.current);
      } else {
        acc.current = 0;
      }
      return acc;
    },
    { current: 0, max: 0 }
  ).max;

  const dateRange = recentSessions.length > 0 && {
    start: format(new Date(recentSessions[0].date), "dd MMM yyyy"),
    end: format(
      new Date(recentSessions[recentSessions.length - 1].date),
      "dd MMM yyyy"
    ),
  };

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader className="pb-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <CardTitle className="text-2xl font-bold">
              {team.name ||
                [team.age, getDisplayGender(team.gender, team.age), team.skill]
                  .filter(Boolean)
                  .join(" • ")}
            </CardTitle>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {team.playerTeamConnections?.length ?? 0} Players • Coach:{" "}
                  <span className="text-foreground capitalize">
                    {team.coach
                      ? `${team.coach.firstName} ${team.coach.lastName}`
                      : "No coach assigned"}
                  </span>
                </span>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="capitalize">
                  {team.age}
                </Badge>
                {team.gender && (
                  <Badge variant="outline" className="capitalize">
                    {team.gender.toLowerCase()}
                  </Badge>
                )}
                {team.skill && (
                  <Badge variant="secondary" className="capitalize">
                    {team.skill}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Link href={`attendance/statistics/${team.id}`}>
            <Button variant="default" size="default" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              View Player Details
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {hasStats ? (
          <>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-muted-foreground">
                  All-Time Stats
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatItem
                  icon={Calendar}
                  label="Total Sessions"
                  value={stats.totalSessions}
                />
                <StatItem
                  icon={BarChart3}
                  label="Overall Attendance Rate"
                  value={`${Math.round(stats.averageAttendanceRate)}%`}
                />
                <StatItem
                  icon={Clock}
                  label="Late Arrival Rate"
                  value={`${Math.round(
                    (stats.totalLate / (stats.totalPresent + stats.totalLate)) *
                      100
                  )}%`}
                />
                <StatItem
                  icon={Trophy}
                  label="On-Time Rate"
                  value={`${Math.round(
                    (stats.totalPresent /
                      (stats.totalPresent +
                        stats.totalLate +
                        stats.totalAbsent)) *
                      100
                  )}%`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">
                      Attendance & Accuracy Trends
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Last 10 sessions performance
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
                            light: "hsl(var(--primary))",
                            dark: "hsl(var(--primary))",
                          },
                        },
                        accuracy: {
                          label: "Accuracy Rate",
                          theme: {
                            light: "hsl(var(--destructive))",
                            dark: "hsl(var(--destructive))",
                          },
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={recentTrendData}>
                          <XAxis
                            dataKey="dateFormatted"
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
                                      {payload[0].payload.dateFormatted}
                                    </span>
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <span className="font-bold">
                                          {payload[0].value}% Attendance
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-destructive" />
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
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <span className="text-sm text-muted-foreground">
                                      Attendance Rate
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-destructive" />
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
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={true}
                          />
                          <Line
                            name="Accuracy Rate"
                            type="monotone"
                            dataKey="accuracy"
                            stroke="hsl(var(--destructive))"
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
                      Last 10 sessions performance
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
                            light: "hsl(var(--primary))",
                            dark: "hsl(var(--primary))",
                          },
                        },
                        accuracy: {
                          label: "Accuracy Rate",
                          theme: {
                            light: "hsl(var(--destructive))",
                            dark: "hsl(var(--destructive))",
                          },
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={dayOfWeekData}>
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
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <span className="font-bold">
                                          {payload[0].value}% Attendance
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-destructive" />
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
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <span className="text-sm text-muted-foreground">
                                      Attendance Rate
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-destructive" />
                                    <span className="text-sm text-muted-foreground">
                                      Accuracy Rate
                                    </span>
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Bar
                            name="Attendance Rate"
                            dataKey="attendance"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            name="Accuracy Rate"
                            dataKey="accuracy"
                            fill="hsl(var(--destructive))"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Alert>
            <AlertDescription>No attendance data available</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default function AttendanceStatisticsPage({
  params,
}: {
  params: { domain: string };
}) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("all");
  const { data: tenant, isLoading: isTenantLoading } = useTenantByDomain(
    params.domain
  );
  const { data: teams, isLoading: isTeamsLoading } = useGetTeamsByTenantId(
    tenant?.id.toString() ?? ""
  );
  const { data: seasons } = useSeasonsByTenantId(tenant?.id.toString() ?? "");
  const { data: selectedSeason } = useSeasonsByTenantId(
    tenant?.id.toString() ?? ""
  );
  const activeSeason = selectedSeason?.find((s) => s.isActive) ?? null;

  const isLoading = isTenantLoading || isTeamsLoading;

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  if (!teams?.length) {
    return (
      <Alert>
        <AlertDescription>No teams found</AlertDescription>
      </Alert>
    );
  }

  const filteredTeams =
    selectedTeamId === "all"
      ? teams
      : teams.filter((team) => team.id.toString() === selectedTeamId);

  const gridCols = filteredTeams.length === 1 ? "" : "md:grid-cols-2";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Statistics</h1>
          <p className="text-muted-foreground">
            {activeSeason ? (
              <>
                Attendance statistics for{" "}
                <span className="font-medium">
                  {activeSeason.customName ??
                    `${format(
                      new Date(activeSeason.startDate),
                      "dd MMM yyyy"
                    )} - ${format(
                      new Date(activeSeason.endDate),
                      "dd MMM yyyy"
                    )}`}
                </span>
              </>
            ) : (
              "View attendance statistics for each team"
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedTeamId}
            onValueChange={(value) => setSelectedTeamId(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {team.name ||
                    [
                      team.age,
                      getDisplayGender(team.gender, team.age),
                      team.skill,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SeasonSelect
            seasons={seasons ?? []}
            selectedSeason={activeSeason}
            tenantId={tenant?.id.toString() ?? ""}
          />
        </div>
      </div>
      <div className="space-y-6">
        {filteredTeams.map((team) => (
          <TeamCard
            key={team.id}
            team={{
              id: team.id,
              name: team.name ?? null,
              age: team.age ?? null,
              gender: team.gender ?? null,
              skill: team.skill ?? null,
              playerTeamConnections: team.playerTeamConnections ?? undefined,
              coach: team.coach
                ? {
                    firstName: team.coach.firstName ?? null,
                    lastName: team.coach.lastName ?? null,
                  }
                : null,
            }}
            tenantId={tenant?.id.toString() ?? ""}
            seasonId={activeSeason?.id.toString()}
          />
        ))}
      </div>
    </div>
  );
}
