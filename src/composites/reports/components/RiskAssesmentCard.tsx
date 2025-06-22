import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { AttendanceSessionAggregateWithGroup } from "@/entities/reports/AttendanceReport.schemas";
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "../../../components/ui/badge";
import { createGroupDisplay } from "../../../entities/group/Group.utils";
import { formatAttendanceRate } from "../../../entities/reports/AttendanceReport.utils";
import { calculateRiskScore } from "../utils/reportCalculations";

export function RiskAssessmentCard({
  sessionAggregates,
}: {
  sessionAggregates: AttendanceSessionAggregateWithGroup[];
}) {
  const { tenant } = useTenantAndUserAccessContext();

  const riskGroups = sessionAggregates
    .map((group) => ({
      ...group,
      riskScore: calculateRiskScore(group),
    }))
    .filter((group) => group.riskScore > 30)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 3);

  if (riskGroups.length === 0) {
    return (
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-700 dark:text-green-300">
            🎉 All groups are performing well! No attendance risks detected.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Groups Needing Attention
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {riskGroups.map((group) => {
          const groupDisplayName = createGroupDisplay(
            group.group,
            tenant?.tenantConfigs?.groups || undefined
          );

          return (
            <div
              key={group.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{groupDisplayName}</p>
                  <Link
                    href={`/management/group/${group.groupId}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatAttendanceRate(group.averageAttendanceRate)} attendance
                  rate
                </p>
              </div>
              <Badge variant="destructive">Risk: {group.riskScore}%</Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
