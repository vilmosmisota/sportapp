"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { ActiveSessionsCarousel } from "@/composites/attendance/components/ActiveSessionsCarousel";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { useActiveAttendanceSessions } from "@/entities/attendance/ActiveAttendanceSession.query";
import { Calendar, Loader2 } from "lucide-react";

export default function LiveSessionsPage() {
  const { tenant } = useTenantAndUserAccessContext();

  const { data: activeSessions, isLoading } = useActiveAttendanceSessions(
    tenant?.id.toString()
  );

  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="space-y-6">
          <PageHeader
            title="Live Sessions"
            description="Manage active attendance sessions in real-time"
          />
          <div className="w-full h-48 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <PageHeader
          title="Live Sessions"
          description="Manage active attendance sessions in real-time"
        />

        {/* Active sessions carousel */}
        {activeSessions && activeSessions.length > 0 ? (
          <ActiveSessionsCarousel
            activeSessions={activeSessions}
            tenantId={tenant?.id.toString() || ""}
            tenantGroupsConfig={tenant?.tenantConfigs?.groups || undefined}
          />
        ) : (
          <Card className="mb-6 bg-muted/40">
            <CardContent className="p-6 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Active Sessions</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                There are no active attendance sessions at the moment. Sessions
                will appear here once they are started from the main attendance
                dashboard.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  );
}
