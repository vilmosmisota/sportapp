import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ChartContainer } from "@/components/ui/chart";

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

interface AttendanceChartsProps {
  trendData: TrendData[];
  dayStats: DayStats[];
}

export function AttendanceCharts({
  trendData,
  dayStats,
}: AttendanceChartsProps) {
  return (
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
              <ResponsiveContainer width="100%" aspect={1.8}>
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
              <ResponsiveContainer width="100%" aspect={1.8}>
                <BarChart data={dayStats}>
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
  );
}
