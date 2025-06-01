"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useGetTeamsByTenantId } from "@/entities/group/Group.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Clock, Trophy, Calendar } from "lucide-react";
import Link from "next/link";
import {
  getDisplayGender,
  getDisplayAgeGroup,
} from "@/entities/group/Group.schema";
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
import SeasonSelect from "@/components/calendar/SeasonSelect";
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
import { PageHeader } from "@/components/ui/page-header";
import { Season } from "@/entities/season/Season.schema";
import {
  calculateAttendanceRate,
  calculateAccuracyRate,
} from "@/entities/attendance/Attendance.utils";
import { useTenantAndUserAccessContext } from "../../../../../../components/auth/TenantAndUserAccessContext";

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
  onTimeCount: number;
  lateCount: number;
  absentCount: number;
};

type DayStats = {
  total: number;
  onTime: number;
  late: number;
  absent: number;
};

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

function TeamCard({
  team,
  tenantId,
  seasonId,
}: {
  team: {
    id: number;
    name: string | null | undefined;
    age: string | null | undefined;
    gender: string | null | undefined;
    skill: string | null | undefined;
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
      <Card data-testid="team-card-loading">
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
          <CardTitle className="text-lg">{formatTeamName(team)}</CardTitle>
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
      session.onTimeCount + session.lateCount + session.absentCount;
    const attendanceRate = calculateAttendanceRate(
      session.onTimeCount,
      session.lateCount,
      session.absentCount
    );
    const accuracyRate = calculateAccuracyRate(
      session.onTimeCount,
      session.lateCount
    );

    return {
      date: session.date,
      dateFormatted: format(new Date(session.date), "dd MMM yyyy"),
      attendance: attendanceRate,
      accuracy: accuracyRate,
    };
  });

  // Calculate day of week stats from recent sessions
  const dayOfWeekStats = recentSessions.reduce(
    (acc: Record<string, DayStats>, session) => {
      const day = format(new Date(session.date), "EEE");
      if (!acc[day]) {
        acc[day] = { total: 0, onTime: 0, late: 0, absent: 0 };
      }
      acc[day].total++;
      acc[day].onTime += session.onTimeCount;
      acc[day].late += session.lateCount;
      acc[day].absent += session.absentCount;
      return acc;
    },
    {}
  );

  const dayOfWeekData = Object.entries(dayOfWeekStats).map(([day, data]) => ({
    day,
    attendance: calculateAttendanceRate(data.onTime, data.late, data.absent),
    accuracy: calculateAccuracyRate(data.onTime, data.late),
  }));

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader className="pb-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <CardTitle className="text-2xl font-bold">
              {formatTeamName(team)}
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
                  {getDisplayAgeGroup(team.age ?? null)}
                </Badge>
                {team.gender && (
                  <Badge variant="outline" className="capitalize">
                    {getDisplayGender(team.gender, team.age ?? null)}
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
          <Link href={`/o/dashboard/training-analytics/${team.id}`}>
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
                  icon={Users}
                  label="Total Players"
                  value={team.playerTeamConnections?.length ?? 0}
                />
                <StatItem
                  icon={BarChart3}
                  label="Attendance Rate"
                  value={`${calculateAttendanceRate(
                    stats.totalOnTime,
                    stats.totalLate,
                    stats.totalAbsent
                  )}%`}
                />
                <StatItem
                  icon={Trophy}
                  label="Accuracy Rate"
                  value={`${calculateAccuracyRate(
                    stats.totalOnTime,
                    stats.totalLate
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
                      <ResponsiveContainer width="100%" aspect={1.8}>
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
                      <ResponsiveContainer width="100%" aspect={1.8}>
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
                            name="Attendance Rate"
                            dataKey="attendance"
                            fill="rgb(16 185 129)"
                          />
                          <Bar
                            name="Accuracy Rate"
                            dataKey="accuracy"
                            fill="rgb(14 165 233)"
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
  const { tenant } = useTenantAndUserAccessContext();
  const { data: teams, isLoading: isTeamsLoading } = useGetTeamsByTenantId(
    tenant?.id.toString() ?? ""
  );
  const { data: seasons } = useSeasonsByTenantId(tenant?.id.toString() ?? "");
  const { data: selectedSeason } = useSeasonsByTenantId(
    tenant?.id.toString() ?? ""
  );
  const activeSeason = selectedSeason?.find((s: Season) => s.isActive) ?? null;

  const isLoading = isTeamsLoading;

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" data-testid="skeleton" />;
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

  return (
    <ErrorBoundary>
      <div className="w-full space-y-6">
        <PageHeader
          title="Attendance Statistics"
          description={
            activeSeason
              ? `Attendance statistics for ${
                  activeSeason.customName ??
                  `${format(
                    new Date(activeSeason.startDate),
                    "dd MMM yyyy"
                  )} - ${format(new Date(activeSeason.endDate), "dd MMM yyyy")}`
                }`
              : "View attendance statistics for all teams"
          }
          actions={
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
                      {formatTeamName(team)}
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
          }
        />

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
    </ErrorBoundary>
  );
}
