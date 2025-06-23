"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { SeasonSelector } from "@/components/ui/season-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { GroupReportCard } from "@/composites/reports/components/GroupReportCard";
import { MemberAttendanceTable } from "@/composites/reports/components/MemberAttendanceTable";
import { MemberPerformanceOverview } from "@/composites/reports/components/MemberPerformanceOverview";
import { StatItem } from "@/composites/reports/components/StatsItem";
import { createGroupDisplay } from "@/entities/group/Group.utils";
import { useAttendanceRecordAggregatesByGroup } from "@/entities/reports/AttendanceRecord.query";
import { useAttendanceSessionAggregatesByGroup } from "@/entities/reports/AttendanceReport.query";
import {
  calculateSeasonOverallStats,
  formatAttendanceRate,
} from "@/entities/reports/AttendanceReport.utils";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { format } from "date-fns";
import { BarChart3, Calendar, Trophy, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AttendanceReportPage() {
  const params = useParams();
  const { tenant } = useTenantAndUserAccessContext();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");

  const groupId = parseInt(params.id as string);
  const tenantId = tenant?.id?.toString() || "";

  // Get seasons
  const { data: seasons, isLoading: seasonsLoading } =
    useSeasonsByTenantId(tenantId);

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

  // Get session aggregate for this specific group using the correct service
  const {
    data: groupSessionAggregate,
    isLoading: sessionDataLoading,
    error: sessionError,
  } = useAttendanceSessionAggregatesByGroup(
    tenant?.id || 0,
    groupId,
    selectedSeason?.id || 0,
    !!tenant?.id && !!groupId && !!selectedSeason?.id
  );

  // Get attendance record aggregates for this group
  const {
    data: recordAggregates = [],
    isLoading: recordDataLoading,
    error: recordError,
  } = useAttendanceRecordAggregatesByGroup(
    tenant?.id || 0,
    groupId,
    selectedSeason?.id,
    !!tenant?.id && !!groupId && !!selectedSeason?.id
  );

  const isLoading = seasonsLoading || sessionDataLoading || recordDataLoading;

  const handleSeasonChange = (seasonId: string) => {
    setSelectedSeasonId(seasonId);
  };

  const getGroupDisplayName = () => {
    if (!groupSessionAggregate?.group) return "Group Report";
    return createGroupDisplay(
      groupSessionAggregate.group,
      tenant?.tenantConfigs?.groups || undefined
    );
  };

  const getDescription = () => {
    const groupName = getGroupDisplayName();

    if (!selectedSeason) {
      return `Detailed attendance reports and statistics for ${groupName}`;
    }

    const dateRange = `${format(
      new Date(selectedSeason.startDate),
      "dd/MM/yyyy"
    )} - ${format(new Date(selectedSeason.endDate), "dd/MM/yyyy")}`;

    return `${groupName} attendance reports for ${
      selectedSeason.customName
        ? `${selectedSeason.customName} (${dateRange})`
        : dateRange
    }`;
  };

  // Show group not found state (when session aggregate doesn't exist)
  if (sessionError && !sessionDataLoading) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Group Report Not Found"
          description="No attendance data found for this group or you don't have access to it."
          backButton={{
            href: "/management/attendance/reports",
            label: "Back to Reports",
          }}
        />
      </div>
    );
  }

  if (seasons?.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Group Report"
          description="Detailed attendance reports and statistics for this group"
          backButton={{
            href: "/management/attendance/reports",
            label: "Back to Reports",
          }}
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Loading..."
          description="Loading group attendance reports..."
          backButton={{
            href: "/management/attendance/reports",
            label: "Back to Reports",
          }}
          actions={<Skeleton className="h-10 w-[200px]" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const groupStats = groupSessionAggregate
    ? calculateSeasonOverallStats([groupSessionAggregate])
    : {
        totalSessions: 0,
        totalOnTime: 0,
        totalLate: 0,
        totalAbsent: 0,
        averageAttendanceRate: 0,
        totalGroups: 0,
      };

  return (
    <div className="space-y-6">
      <PageHeader
        title={getGroupDisplayName()}
        description={getDescription()}
        backButton={{
          href: "/management/attendance/reports",
          label: "Back to Reports",
        }}
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
      {(sessionError || recordError) && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load attendance reports. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Data Display */}
      {!sessionError && !recordError && selectedSeason && (
        <>
          {/* Overall Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatItem
              icon={Users}
              label="Total Members"
              value={recordAggregates.length}
              trend="neutral"
            />
            <StatItem
              icon={Calendar}
              label="Total Sessions"
              value={groupStats.totalSessions}
              trend="up"
            />
            <StatItem
              icon={BarChart3}
              label="Average Attendance"
              value={formatAttendanceRate(groupStats.averageAttendanceRate)}
              trend={
                groupStats.averageAttendanceRate > 80
                  ? "up"
                  : groupStats.averageAttendanceRate > 60
                  ? "neutral"
                  : "down"
              }
            />
            <StatItem
              icon={Trophy}
              label="On-Time Rate"
              value={
                groupStats.totalOnTime + groupStats.totalLate > 0
                  ? formatAttendanceRate(
                      (groupStats.totalOnTime /
                        (groupStats.totalOnTime + groupStats.totalLate)) *
                        100
                    )
                  : "0%"
              }
              trend="up"
            />
          </div>

          {/* Group Detailed Report Card */}
          {groupSessionAggregate ? (
            <GroupReportCard
              aggregate={groupSessionAggregate}
              showDetailsButton={false}
              isDetails={true}
            />
          ) : (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                No attendance data available for this group in the selected
                season. Complete some attendance sessions to see reports.
              </AlertDescription>
            </Alert>
          )}

          {/* Member Performance Overview */}
          <MemberPerformanceOverview
            recordAggregates={recordAggregates}
            data-testid="member-performance-overview"
          />

          {/* Member Attendance Table */}
          <MemberAttendanceTable
            recordAggregates={recordAggregates}
            data-testid="member-attendance-table"
          />
        </>
      )}
    </div>
  );
}
