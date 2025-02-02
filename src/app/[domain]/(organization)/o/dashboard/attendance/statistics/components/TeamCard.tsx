import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamAttendanceAggregates } from "@/entities/attendance/Attendance.actions.client";
import { getDisplayGender } from "@/entities/team/Team.schema";
import { BarChart3, Users, Clock, Trophy, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ChartContainer } from "@/components/ui/chart";
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
import { TeamCardProps, SessionData } from "../types";
import { StatItem } from "./StatItem";
import {
  calculateLateArrivalRate,
  calculateOnTimeRate,
  formatRecentTrendData,
  calculateDayOfWeekStats,
} from "../utils/calculations";

export function TeamCard({ team, tenantId, seasonId }: TeamCardProps) {
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError,
  } = useTeamAttendanceAggregates(Number(team.id), Number(seasonId), tenantId);

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
  const recentSessions =
    (stats?.sessions as SessionData[] | undefined)
      ?.slice(0, 10)
      .sort(
        (a: SessionData, b: SessionData) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      ) ?? [];

  const recentTrendData = formatRecentTrendData(recentSessions);
  const dayOfWeekData = calculateDayOfWeekStats(recentSessions);

  const ChartTooltipContent = ({ active, payload, title }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex flex-col gap-2">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {title ?? payload[0].payload.dateFormatted}
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="font-bold">{payload[0].value}% Attendance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <span className="font-bold">{payload[1].value}% Accuracy</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ChartLegendContent = () => (
    <div className="flex justify-center gap-6">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary" />
        <span className="text-sm text-muted-foreground">Attendance Rate</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-destructive" />
        <span className="text-sm text-muted-foreground">Accuracy Rate</span>
      </div>
    </div>
  );

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
                  value={`${calculateLateArrivalRate(
                    stats.totalLate,
                    stats.totalPresent
                  )}%`}
                />
                <StatItem
                  icon={Trophy}
                  label="On-Time Rate"
                  value={`${calculateOnTimeRate(
                    stats.totalPresent,
                    stats.totalPresent + stats.totalLate + stats.totalAbsent
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
                            content={(props) => (
                              <ChartTooltipContent {...props} />
                            )}
                          />
                          <Legend
                            verticalAlign="top"
                            height={36}
                            content={ChartLegendContent}
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
                            content={(props) => (
                              <ChartTooltipContent
                                {...props}
                                title={props.payload?.[0]?.payload?.day}
                              />
                            )}
                          />
                          <Legend
                            verticalAlign="top"
                            height={36}
                            content={ChartLegendContent}
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
