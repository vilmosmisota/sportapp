import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, UserCheck, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlayerStat {
  id: string;
  name: string;
  attendanceRate: number;
  accuracyRate: number;
  performanceScore: number;
  onTime: number;
  late: number;
  absent: number;
}

interface PerformanceOverviewProps {
  topPerformers: PlayerStat[];
  bottomPerformers: PlayerStat[];
  "data-testid"?: string;
}

export function PerformanceOverview({
  topPerformers,
  bottomPerformers,
  "data-testid": dataTestId,
}: PerformanceOverviewProps) {
  // Check if the top performer has better stats than the second performer
  const hasTopPerformer =
    topPerformers.length > 1 &&
    topPerformers[0].performanceScore > topPerformers[1].performanceScore;

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
                        ((OnTime × 1.0) + (Late × 0.5) - (Absent × 0.25)) ÷
                        Total Sessions × 100
                      </p>
                      <ul className="text-xs list-disc pl-5 space-y-1">
                        <li>OnTime attendance gets full credit</li>
                        <li>Late attendance gets half credit</li>
                        <li>Absences apply a small penalty</li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">
              Players with highest attendance performance
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((player, index) => (
              <div key={player.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {index === 0 && hasTopPerformer && (
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-600"
                    >
                      {player.performanceScore}% Performance
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <UserCheck className="h-3 w-3" />
                      <span>{player.onTime}</span>
                      <Clock className="h-3 w-3 ml-1" />
                      <span>{player.late}</span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={player.performanceScore}
                  className="h-2 bg-blue-50 [&>div]:bg-blue-500"
                />
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
                        ((OnTime × 1.0) + (Late × 0.5) - (Absent × 0.25)) ÷
                        Total Sessions × 100
                      </p>
                      <ul className="text-xs list-disc pl-5 space-y-1">
                        <li>OnTime attendance gets full credit</li>
                        <li>Late attendance gets half credit</li>
                        <li>Absences apply a small penalty</li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">
              Players who need additional support
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bottomPerformers.map((player) => (
              <div key={player.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{player.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-orange-50 text-orange-600"
                    >
                      {player.performanceScore}% Performance
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <UserCheck className="h-3 w-3" />
                      <span>{player.onTime}</span>
                      <Clock className="h-3 w-3 ml-1" />
                      <span>{player.late}</span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={player.performanceScore}
                  className="h-2 bg-orange-50 [&>div]:bg-orange-300"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
