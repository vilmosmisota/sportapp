"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { AttendanceManager } from "@/composites/attendance/AttendanceManager";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";

export default function AttendancePage() {
  const { tenant } = useTenantAndUserAccessContext();

  if (!tenant) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center space-y-2">
        <h3 className="text-lg font-medium">Organization not found</h3>
        <p className="text-sm text-muted-foreground">
          The organization you&apos;re looking for does not exist.
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <PageHeader
          title="Attendance"
          description="Manage attendance for training sessions"
        />

        <AttendanceManager
          tenantId={tenant.id.toString()}
          tenantGroupsConfig={tenant.tenantConfigs?.groups || undefined}
        />
      </div>
    </ErrorBoundary>
  );
}
