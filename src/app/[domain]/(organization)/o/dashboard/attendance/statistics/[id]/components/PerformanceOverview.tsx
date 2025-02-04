import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PlayerStat {
  id: string;
  name: string;
  attendanceRate: number;
  accuracyRate: number;
}

interface PerformanceOverviewProps {
  topPerformers: PlayerStat[];
  bottomPerformers: PlayerStat[];
}

export function PerformanceOverview({
  topPerformers,
  bottomPerformers,
}: PerformanceOverviewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
              Top Performers
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Players with highest attendance and accuracy
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((player, index) => (
              <div key={player.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-600"
                    >
                      {player.attendanceRate}% Attendance
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-sky-50 text-sky-600"
                    >
                      {player.accuracyRate}% Accuracy
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress
                    value={player.attendanceRate}
                    className="h-2 bg-emerald-50 [&>div]:bg-emerald-500"
                  />
                  <Progress
                    value={player.accuracyRate}
                    className="h-2 bg-sky-50 [&>div]:bg-sky-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
              Areas for Improvement
            </CardTitle>
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
                  <div className="flex gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-rose-50 text-rose-600"
                    >
                      {player.attendanceRate}% Attendance
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-orange-50 text-orange-600"
                    >
                      {player.accuracyRate}% Accuracy
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress
                    value={player.attendanceRate}
                    className="h-2 bg-rose-50 [&>div]:bg-rose-200"
                  />
                  <Progress
                    value={player.accuracyRate}
                    className="h-2 bg-orange-50 [&>div]:bg-orange-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
