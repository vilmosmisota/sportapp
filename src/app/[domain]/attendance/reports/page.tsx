"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { SeasonSelector } from "@/components/ui/season-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { GroupReportCard } from "@/composites/reports/components/GroupReportCard";
import { StatItem } from "@/composites/reports/components/StatsItem";
import { createGroupDisplay } from "@/entities/group/Group.utils";
import { useAttendanceSessionAggregatesBySeason } from "@/entities/reports/AttendanceReport.query";
import { AttendanceSessionAggregateWithGroup } from "@/entities/reports/AttendanceReport.schemas";
import {
  calculateSeasonOverallStats,
  formatAttendanceRate,
} from "@/entities/reports/AttendanceReport.utils";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { format } from "date-fns";
import { BarChart3, Calendar, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";

function GroupPerformanceSection({
  sessionAggregates,
}: {
  sessionAggregates: AttendanceSessionAggregateWithGroup[];
}) {
  const { tenant } = useTenantAndUserAccessContext();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");

  const filteredAggregates =
    selectedGroupId === "all"
      ? sessionAggregates
      : sessionAggregates.filter(
          (aggregate) => aggregate.groupId.toString() === selectedGroupId
        );

  const sortedAggregates = filteredAggregates.sort(
    (a, b) => b.averageAttendanceRate - a.averageAttendanceRate
  );

  const groupOptions = [
    { value: "all", label: "All Groups" },
    ...sessionAggregates.map((aggregate) => ({
      value: aggregate.groupId.toString(),
      label: createGroupDisplay(
        aggregate.group,
        tenant?.tenantConfigs?.groups || undefined
      ),
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Group Performance</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Showing {filteredAggregates.length} of {sessionAggregates.length}{" "}
            groups
          </span>
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              {groupOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-6">
        {sortedAggregates.map((aggregate) => (
          <GroupReportCard key={aggregate.id} aggregate={aggregate} />
        ))}
      </div>
    </div>
  );
}

export default function AttendanceReportsPage() {
  const { tenant } = useTenantAndUserAccessContext();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");

  const { data: seasons, isLoading: seasonsLoading } = useSeasonsByTenantId(
    tenant?.id?.toString() || ""
  );

  const activeSeason = seasons?.find((season) => season.isActive);

  useEffect(() => {
    if (activeSeason && !selectedSeasonId) {
      setSelectedSeasonId(activeSeason.id.toString());
    }
  }, [activeSeason, selectedSeasonId]);

  // Get selected season
  const selectedSeason = seasons?.find(
    (season) => season.id.toString() === selectedSeasonId
  );

  const {
    data: sessionAggregates = [],
    isLoading: dataLoading,
    error,
  } = useAttendanceSessionAggregatesBySeason(
    tenant?.id || 0,
    selectedSeason?.id || 0,
    !!tenant?.id && !!selectedSeason?.id
  );

  const isLoading = seasonsLoading || dataLoading;

  const overallStats = calculateSeasonOverallStats(sessionAggregates);

  const handleSeasonChange = (seasonId: string) => {
    setSelectedSeasonId(seasonId);
  };

  const getDescription = () => {
    if (!selectedSeason) {
      return "View comprehensive attendance reports and statistics for your groups";
    }

    const dateRange = `${format(
      new Date(selectedSeason.startDate),
      "dd/MM/yyyy"
    )} - ${format(new Date(selectedSeason.endDate), "dd/MM/yyyy")}`;

    return `Attendance reports for ${
      selectedSeason.customName
        ? `${selectedSeason.customName} (${dateRange})`
        : dateRange
    }`;
  };

  // Show no seasons state
  if (seasons?.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Attendance Reports"
          description="View comprehensive attendance reports and statistics for your groups"
        />
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            No seasons found. Create a season first to view attendance reports.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Attendance Reports"
          description="Loading attendance reports..."
          actions={<Skeleton className="h-10 w-[200px]" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Reports"
        description={getDescription()}
        actions={
          <SeasonSelector
            seasons={seasons}
            selectedSeason={selectedSeason}
            onSeasonChange={handleSeasonChange}
            isLoading={seasonsLoading}
            placeholder="Select season"
            width="w-[200px]"
          />
        }
      />

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load attendance reports. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Data Display */}
      {!error && selectedSeason && (
        <>
          {/* Overall Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatItem
              icon={Users}
              label="Total Groups"
              value={overallStats.totalGroups}
              trend="neutral"
            />
            <StatItem
              icon={Calendar}
              label="Total Sessions"
              value={overallStats.totalSessions}
              trend="up"
            />
            <StatItem
              icon={BarChart3}
              label="Average Attendance"
              value={formatAttendanceRate(overallStats.averageAttendanceRate)}
              trend={
                overallStats.averageAttendanceRate > 80
                  ? "up"
                  : overallStats.averageAttendanceRate > 60
                  ? "neutral"
                  : "down"
              }
            />
            <StatItem
              icon={Trophy}
              label="On-Time Rate"
              value={
                overallStats.totalOnTime + overallStats.totalLate > 0
                  ? formatAttendanceRate(
                      (overallStats.totalOnTime /
                        (overallStats.totalOnTime + overallStats.totalLate)) *
                        100
                    )
                  : "0%"
              }
              trend="up"
            />
          </div>

          {/* Risk Assessment */}
          {/* {sessionAggregates.length > 0 && (
            <RiskAssessmentCard sessionAggregates={sessionAggregates} />
          )} */}

          {/* Group Cards */}
          {sessionAggregates.length > 0 ? (
            <GroupPerformanceSection sessionAggregates={sessionAggregates} />
          ) : (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                No attendance data available for the selected season. Complete
                some attendance sessions to see reports.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
