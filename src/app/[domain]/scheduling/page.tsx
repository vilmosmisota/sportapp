"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { useSessionsByTenantForDays } from "@/entities/session/Session.query";
import { format } from "date-fns";
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  Coffee,
  Users,
} from "lucide-react";
import Link from "next/link";
import { WeeklySessionsCarousel } from "./components/WeeklySessionsCarousel";

// Loading skeleton component inline to avoid import issues
function SchedulingDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-4 w-96 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 mb-2 bg-muted animate-pulse rounded" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function SchedulingDashboard() {
  const { tenant } = useTenantAndUserAccessContext();
  const tenantId = tenant?.id?.toString() || "";

  const { data: seasons, isLoading: isSeasonsLoading } =
    useSeasonsByTenantId(tenantId);
  const { data: sessions, isLoading: isSessionsLoading } =
    useSessionsByTenantForDays(tenantId, 7);

  if (isSeasonsLoading || isSessionsLoading || !tenant) {
    return <SchedulingDashboardSkeleton />;
  }

  // Calculate stats
  const totalSeasons = seasons?.length || 0;
  const activeSeasons = seasons?.filter((season) => season.isActive) || [];
  const totalSessions = sessions?.length || 0;
  const upcomingSessions =
    sessions?.filter((session) => new Date(session.date) >= new Date())
      ?.length || 0;

  // Get the current active season for detailed display
  const currentActiveSeason = activeSeasons[0]; // Assuming there's typically one active season

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Scheduling Dashboard"
          description="Manage your seasons, sessions, and training schedules."
        />
        <Link href="/scheduling/calendar">
          <Button className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4" />
            Full Calendar
          </Button>
        </Link>
      </div>

      {/* Active Season Information */}
      {currentActiveSeason && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg text-green-800">
                  {currentActiveSeason.customName || "Current Season"}
                </CardTitle>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  Active
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Season Duration
                </h4>
                <p className="text-sm">
                  <span className="font-medium">
                    {format(currentActiveSeason.startDate, "MMM d, yyyy")}
                  </span>
                  {" - "}
                  <span className="font-medium">
                    {format(currentActiveSeason.endDate, "MMM d, yyyy")}
                  </span>
                </p>
              </div>

              {currentActiveSeason.breaks &&
                currentActiveSeason.breaks.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Coffee className="h-4 w-4" />
                      Scheduled Breaks
                    </h4>
                    <div className="space-y-1">
                      {currentActiveSeason.breaks.map((breakPeriod, index) => (
                        <p key={index} className="text-sm">
                          {format(breakPeriod.from, "MMM d")} -{" "}
                          {format(breakPeriod.to, "MMM d, yyyy")}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduling Dashboard Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Seasons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSeasons}</div>
            <p className="text-xs text-muted-foreground">
              {activeSeasons.length} active seasons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Weekly Sessions
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Sessions
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions}</div>
            <p className="text-xs text-muted-foreground">Not yet started</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(
                sessions?.map((session) => session.group?.id).filter(Boolean)
              ).size || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              With scheduled sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Sessions Carousel */}
      {sessions && sessions.length > 0 && (
        <WeeklySessionsCarousel
          sessions={sessions}
          tenantId={tenantId}
          tenantGroupsConfig={tenant?.tenantConfigs?.groups || undefined}
        />
      )}
    </div>
  );
}
