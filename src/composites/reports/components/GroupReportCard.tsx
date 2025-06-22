"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip as UITooltip,
} from "@/components/ui/tooltip";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { createGroupDisplay } from "@/entities/group/Group.utils";
import { AttendanceSessionAggregateWithGroup } from "@/entities/reports/AttendanceReport.schemas";
import {
  formatAttendanceRate,
  getAttendanceRateColor,
} from "@/entities/reports/AttendanceReport.utils";
import {
  Activity,
  BarChart3,
  Calendar,
  CheckCircle,
  Info,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "../../../libs/tailwind/utils";
import {
  calculateAttendanceTrend,
  calculateAverageSessionSize,
  calculateConsistencyScore,
  calculateDayOfWeekStats,
  calculateOnTimeRate,
  formatTrendData,
} from "../utils/reportCalculations";

interface InsightCardProps {
  icon: any;
  title: string;
  description: string;
  value: string;
  trend?: "up" | "down" | "stable";
  color?: "green" | "yellow" | "red" | "blue";
}

function InsightCard({
  icon: Icon,
  title,
  description,
  value,
  trend,
  color = "blue",
}: InsightCardProps) {
  const colorClasses = {
    green:
      "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    yellow:
      "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
    red: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
    blue: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
  };

  const iconColors = {
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
    blue: "text-blue-600",
  };

  return (
    <Card className={`${colorClasses[color]} border`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 mt-0.5 ${iconColors[color]}`} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{title}</h4>
              <div className="flex items-center gap-1">
                <span className={`font-bold text-lg ${iconColors[color]}`}>
                  {value}
                </span>
                {trend && (
                  <div
                    className={`${
                      trend === "up"
                        ? "text-green-500"
                        : trend === "down"
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {trend === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : trend === "down" ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <Activity className="h-3 w-3" />
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface GroupReportCardProps {
  aggregate: AttendanceSessionAggregateWithGroup;
  showCharts?: boolean;
  showDetailsButton?: boolean;
  className?: string;
  isDetails?: boolean;
}

export function GroupReportCard({
  aggregate,
  showCharts = true,
  showDetailsButton = true,
  className,
  isDetails = false,
}: GroupReportCardProps) {
  const { tenant } = useTenantAndUserAccessContext();

  const attendanceRate = aggregate.averageAttendanceRate;
  const onTimeRate = calculateOnTimeRate(
    aggregate.totalOnTime,
    aggregate.totalLate
  );

  const groupDisplayName = createGroupDisplay(
    aggregate.group,
    tenant?.tenantConfigs?.groups || undefined
  );

  const recentSessions = aggregate.sessions;

  const trend = calculateAttendanceTrend(recentSessions);
  const averageSessionSize = calculateAverageSessionSize(
    aggregate.totalOnTime,
    aggregate.totalLate,
    aggregate.totalAbsent,
    aggregate.totalSessions
  );
  const consistencyScore = calculateConsistencyScore(recentSessions);

  const recentTrendData = formatTrendData(recentSessions);
  const dayOfWeekData = calculateDayOfWeekStats(recentSessions);

  return (
    <Card
      className={`${className || ""} ${
        isDetails ? "border-none p-0 m-0 shadow-none" : ""
      }`}
    >
      {!isDetails && (
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl font-bold">
                  {groupDisplayName}
                </CardTitle>
                {showDetailsButton && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs"
                  >
                    <Link
                      href={`/management/attendance/reports/${aggregate.groupId}`}
                    >
                      <BarChart3 className="h-3 w-3" />
                      View Details
                    </Link>
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{aggregate.totalSessions} Sessions Completed</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="capitalize">
                    {aggregate.group.ageRange}
                  </Badge>
                  {aggregate.group.level && (
                    <Badge variant="outline" className="capitalize">
                      {aggregate.group.level}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-2xl font-bold ${getAttendanceRateColor(
                  attendanceRate
                )}`}
              >
                {formatAttendanceRate(attendanceRate)}
              </div>
              <p className="text-sm text-muted-foreground">Overall Rate</p>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={`space-y-6 ${cn(isDetails && "p-0 m-0")}`}>
        {/* Meaningful Insights Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Performance Metrics</h3>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong>Attendance Trend:</strong> Compares recent
                      sessions to identify improvement/decline patterns
                    </div>
                    <div>
                      <strong>Average Session Size:</strong> Total attendees ÷
                      number of sessions
                    </div>
                    <div>
                      <strong>Punctuality Rate:</strong> On-time arrivals ÷
                      total attendances
                    </div>
                    <div>
                      <strong>Consistency Score:</strong> Measures how stable
                      attendance numbers are across sessions
                    </div>
                  </div>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InsightCard
              icon={Target}
              title="Attendance Trend"
              description={`Performance is ${
                trend === "up"
                  ? "improving"
                  : trend === "down"
                  ? "declining"
                  : "stable"
              } over recent sessions`}
              value={
                trend === "up"
                  ? "↗ Improving"
                  : trend === "down"
                  ? "↘ Declining"
                  : "→ Stable"
              }
              trend={trend}
              color={
                trend === "up" ? "green" : trend === "down" ? "red" : "blue"
              }
            />

            <InsightCard
              icon={Users}
              title="Average Session Size"
              description="Average number of attendees per session"
              value={`${Math.round(averageSessionSize)} people`}
              color="blue"
            />

            <InsightCard
              icon={CheckCircle}
              title="Punctuality Rate"
              description="Percentage of attendees who arrive on time"
              value={formatAttendanceRate(onTimeRate)}
              color={
                onTimeRate > 80 ? "green" : onTimeRate > 60 ? "yellow" : "red"
              }
            />

            <InsightCard
              icon={Activity}
              title="Consistency Score"
              description="How consistent attendance numbers are session to session"
              value={`${Math.round(Math.max(0, consistencyScore))}%`}
              color={
                consistencyScore > 80
                  ? "green"
                  : consistencyScore > 60
                  ? "yellow"
                  : "red"
              }
            />
          </div>
        </div>

        {/* Charts Section */}
        {showCharts && recentTrendData.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attendance Trend Chart */}
            <Card>
              <CardHeader className="pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold">
                    Attendance & On-Time Trends
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Last {recentTrendData.length} sessions performance
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    attendance: {
                      label: "Attendance Rate",
                      theme: {
                        light: "hsl(var(--emerald-500))",
                        dark: "hsl(var(--emerald-500))",
                      },
                    },
                    onTime: {
                      label: "On-Time Rate",
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
                                      {payload[1].value}% On-Time
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
                                  On-Time Rate
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
                        name="On-Time Rate"
                        type="monotone"
                        dataKey="onTime"
                        stroke="rgb(14 165 233)"
                        strokeWidth={2}
                        dot={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Day of Week Performance Chart */}
            {dayOfWeekData.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">
                      Performance by Day of Week
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Average rates by weekday
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      attendance: {
                        label: "Attendance Rate",
                        theme: {
                          light: "hsl(var(--emerald-500))",
                          dark: "hsl(var(--emerald-500))",
                        },
                      },
                      onTime: {
                        label: "On-Time Rate",
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
                                        {payload[1].value}% On-Time
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
                                    On-Time Rate
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
                          name="On-Time Rate"
                          dataKey="onTime"
                          fill="rgb(14 165 233)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
