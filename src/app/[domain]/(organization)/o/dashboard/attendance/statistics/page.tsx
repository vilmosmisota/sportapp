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
import { useTeamAttendanceStats } from "@/entities/attendance/Attendance.query";
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
  } = useTeamAttendanceStats(team.id, tenantId, seasonId);

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

  // Format recent trend data for the line chart
  const recentTrendData = stats?.recentTrend
    ?.map((trend: any) => ({
      date: trend.date,
      dateFormatted: format(new Date(trend.date), "dd MMM yyyy"),
      attendance: trend.attendanceRate,
    }))
    .reverse();

  // Format day of week data for the bar chart
  const dayOfWeekData = stats?.dayOfWeekStats?.map((day: any) => ({
    day: day.dayOfWeek.slice(0, 3),
    attendance: day.attendanceRate,
  }));

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
            <div className="grid grid-cols-4 gap-4">
              <StatItem
                icon={Calendar}
                label="Total Sessions"
                value={stats.totalSessions}
              />
              <StatItem
                icon={Users}
                label="Average Players"
                value={Math.round(stats.averagePlayersPerSession ?? 0)}
              />
              <StatItem
                icon={BarChart3}
                label="Attendance Accuracy"
                value={`${Math.round(stats.averageAttendanceRate ?? 0)}%`}
              />
              <StatItem
                icon={Trophy}
                label="Full Attendance Streak"
                value={stats.mostConsecutiveFullAttendance}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Recent Attendance Trend
                  </CardTitle>
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
                      }}
                    >
                      <LineChart data={recentTrendData}>
                        <defs>
                          <linearGradient
                            id="gradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="100%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="8"
                          stroke="hsl(var(--border))"
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="dateFormatted"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => value.slice(0, 5)}
                          dy={8}
                          padding={{ left: 0, right: 0 }}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}%`}
                          domain={[0, 100]}
                          ticks={[0, 25, 50, 75, 100]}
                          dx={-8}
                        />
                        <Line
                          type="monotone"
                          dataKey="attendance"
                          strokeWidth={2}
                          dot={false}
                          stroke="hsl(var(--primary))"
                        />
                        <Area
                          type="monotone"
                          dataKey="attendance"
                          stroke="none"
                          fill="url(#gradient)"
                          fillOpacity={1}
                        />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Date
                                    </span>
                                    <span className="font-bold">
                                      {payload[0].payload.dateFormatted}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Attendance
                                    </span>
                                    <span className="font-bold">
                                      {payload[0].value}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Attendance by Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px]">
                    <ChartContainer
                      config={{
                        attendance: {
                          label: "Attendance Rate",
                          theme: {
                            light: "hsl(var(--primary))",
                            dark: "hsl(var(--primary))",
                          },
                        },
                      }}
                    >
                      <BarChart data={dayOfWeekData}>
                        <CartesianGrid
                          strokeDasharray="8"
                          stroke="hsl(var(--border))"
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="day"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          dy={8}
                          padding={{ left: 0, right: 0 }}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}%`}
                          domain={[0, 100]}
                          ticks={[0, 25, 50, 75, 100]}
                          dx={-8}
                        />
                        <Bar
                          dataKey="attendance"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Day
                                    </span>
                                    <span className="font-bold">
                                      {payload[0].payload.day}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Attendance
                                    </span>
                                    <span className="font-bold">
                                      {payload[0].value}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        />
                      </BarChart>
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
