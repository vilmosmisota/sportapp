"use client";

import { PageHeader } from "@/components/ui/page-header";
import { AttendanceSessionManager } from "@/composites/attendance/AttendanceSessionManager";
import { useAttendanceSessionData } from "@/composites/attendance/hooks/useAttendanceSessionData";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { createGroupDisplay } from "@/entities/group/Group.utils";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function AttendanceSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { tenant } = useTenantAndUserAccessContext();

  // Dialog state management
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const sessionId = Number(params.id);
  const tenantId = tenant?.id?.toString() ?? "";

  // Get session data for the header
  const { session, isLoading: isSessionLoading } = useAttendanceSessionData(
    sessionId,
    tenantId
  );

  if (!tenant) {
    return <div>Tenant not found</div>;
  }

  const groupConfig = tenant.tenantConfigs?.groups;

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    // Let the composite handle the actual refresh logic
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleDelete = () => {
    router.push(`/management/attendance`);
  };

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Session Not Found"
          description="The attendance session you're looking for doesn't exist or has been closed."
          backButton={{
            href: `/management/attendance`,
            label: "Back to Attendance",
          }}
        />
      </div>
    );
  }

  // Get group display name
  const groupDisplayName = session.session?.group
    ? createGroupDisplay(session.session.group, groupConfig || undefined)
    : null;

  // Create session description for header
  const sessionDescription = (() => {
    const parts = [];

    if (groupDisplayName) {
      parts.push(groupDisplayName);
    }

    if (session.session?.date) {
      parts.push(format(new Date(session.session.date), "EEEE, MMMM d, yyyy"));
    }

    if (session.session?.startTime && session.session?.endTime) {
      const timeRange = `${format(
        new Date(`2000-01-01T${session.session.startTime}`),
        "h:mm a"
      )} - ${format(
        new Date(`2000-01-01T${session.session.endTime}`),
        "h:mm a"
      )}`;
      parts.push(timeRange);
    }

    return parts.join(" • ");
  })();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Attendance Session"
        description={sessionDescription || "View and manage attendance records"}
      />

      <AttendanceSessionManager
        sessionId={sessionId}
        onDelete={handleDelete}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
        tenant={tenant}
        // Pass dialog state to composite
        isConfirmCloseOpen={isConfirmCloseOpen}
        setIsConfirmCloseOpen={setIsConfirmCloseOpen}
        isConfirmDeleteOpen={isConfirmDeleteOpen}
        setIsConfirmDeleteOpen={setIsConfirmDeleteOpen}
      />
    </div>
  );
}
