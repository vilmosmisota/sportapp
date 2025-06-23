import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AttendanceRecordAggregate } from "@/entities/reports/AttendanceRecord.schema";
import { Clock, Info, Trophy, UserCheck, UserX } from "lucide-react";

interface MemberPerformance {
  id: string;
  name: string;
  attendanceRate: number;
  punctualityRate: number;
  performanceScore: number;
  onTime: number;
  late: number;
  absent: number;
  totalSessions: number;
}

interface MemberPerformanceOverviewProps {
  recordAggregates: AttendanceRecordAggregate[];
  "data-testid"?: string;
}

export function MemberPerformanceOverview({
  recordAggregates,
  "data-testid": dataTestId,
}: MemberPerformanceOverviewProps) {
  // Process record aggregates into performance data
  const memberPerformance: MemberPerformance[] = recordAggregates.map(
    (record) => {
      const totalSessions =
        record.totalOnTime + record.totalLate + record.totalAbsent;

      // Calculate attendance rate (on-time + late / total)
      const attendanceRate =
        totalSessions > 0
          ? Math.round(
              ((record.totalOnTime + record.totalLate) / totalSessions) * 100
            )
          : 0;

      // Calculate punctuality rate (on-time / attended sessions)
      const attendedSessions = record.totalOnTime + record.totalLate;
      const punctualityRate =
        attendedSessions > 0
          ? Math.round((record.totalOnTime / attendedSessions) * 100)
          : 0;

      // Calculate performance score using attendance-focused formula
      // OnTime = full credit (1.0), Late = partial credit (0.7), Absent = penalty (-0.2)
      const performanceScore =
        totalSessions > 0
          ? Math.max(
              0,
              Math.round(
                ((record.totalOnTime * 1.0 +
                  record.totalLate * 0.7 +
                  record.totalAbsent * -0.2) /
                  totalSessions) *
                  100
              )
            )
          : 0;

      // Format member name from the joined member data
      const memberName = record.member
        ? `${record.member.firstName || ""} ${
            record.member.lastName || ""
          }`.trim()
        : `Member ${record.memberId}`;

      return {
        id: record.memberId.toString(),
        name: memberName || `Member ${record.memberId}`, // Fallback if name is empty
        attendanceRate,
        punctualityRate,
        performanceScore,
        onTime: record.totalOnTime,
        late: record.totalLate,
        absent: record.totalAbsent,
        totalSessions,
      };
    }
  );

  // Sort by performance score
  const sortedPerformance = [...memberPerformance].sort(
    (a, b) => b.performanceScore - a.performanceScore
  );

  const topPerformers = sortedPerformance.slice(0, 3);
  const bottomPerformers = sortedPerformance.slice(-3).reverse();

  // Check if we have a clear top performer
  const hasTopPerformer =
    topPerformers.length > 1 &&
    topPerformers[0].performanceScore > topPerformers[1].performanceScore;

  if (recordAggregates.length === 0) {
    return (
      <Card data-testid={dataTestId}>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Member Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No member attendance data available for this group and season.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2" data-testid={dataTestId}>
      <Card>
        <CardHeader className="pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                Top Performers
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] p-4">
                    <div className="space-y-2">
                      <p className="font-semibold">
                        Performance Score Formula:
                      </p>
                      <p className="text-sm">
                        ((OnTime × 1.0) + (Late × 0.7) + (Absent × -0.2)) ÷
                        Total Sessions × 100
                      </p>
                      <ul className="text-xs list-disc pl-5 space-y-1">
                        <li>On-time attendance gets full credit</li>
                        <li>Late attendance gets 70% credit</li>
                        <li>Absences apply a penalty</li>
                        <li>Score reflects overall attendance quality</li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">
              Members with highest attendance performance
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((member, index) => (
              <div key={member.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {index === 0 && hasTopPerformer && (
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="font-medium">{member.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-600"
                    >
                      {member.performanceScore}% Score
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <UserCheck className="h-3 w-3" />
                      <span>{member.onTime}</span>
                      <Clock className="h-3 w-3 ml-1" />
                      <span>{member.late}</span>
                      <UserX className="h-3 w-3 ml-1" />
                      <span>{member.absent}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress
                    value={member.performanceScore}
                    className="h-2 bg-green-50 [&>div]:bg-green-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Attendance: {member.attendanceRate}%</span>
                    <span>Punctuality: {member.punctualityRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                Areas for Improvement
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] p-4">
                    <div className="space-y-2">
                      <p className="font-semibold">
                        Performance Score Formula:
                      </p>
                      <p className="text-sm">
                        ((OnTime × 1.0) + (Late × 0.7) + (Absent × -0.2)) ÷
                        Total Sessions × 100
                      </p>
                      <ul className="text-xs list-disc pl-5 space-y-1">
                        <li>On-time attendance gets full credit</li>
                        <li>Late attendance gets 70% credit</li>
                        <li>Absences apply a penalty</li>
                        <li>Score reflects overall attendance quality</li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">
              Members who need additional support
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bottomPerformers.map((member) => (
              <div key={member.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{member.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-orange-50 text-orange-600"
                    >
                      {member.performanceScore}% Score
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <UserCheck className="h-3 w-3" />
                      <span>{member.onTime}</span>
                      <Clock className="h-3 w-3 ml-1" />
                      <span>{member.late}</span>
                      <UserX className="h-3 w-3 ml-1" />
                      <span>{member.absent}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress
                    value={member.performanceScore}
                    className="h-2 bg-orange-50 [&>div]:bg-orange-300"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Attendance: {member.attendanceRate}%</span>
                    <span>Punctuality: {member.punctualityRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
