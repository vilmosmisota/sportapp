"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/ui/page-header";
import { AttendanceSessionManager } from "@/composites/attendance/AttendanceSessionManager";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { useActiveAttendanceSessionWithRecords } from "@/entities/attendance/ActiveAttendanceSessionWithRecords.query";
import { format } from "date-fns";
import {
  Archive,
  Key,
  Loader2,
  MoreVertical,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function AttendanceSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { tenant } = useTenantAndUserAccessContext();
  const sessionId = Number(params.id);

  // State for confirmation dialogs
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Fetch session data for page header information
  const { data: sessionData, isLoading: isSessionLoading } =
    useActiveAttendanceSessionWithRecords(
      sessionId,
      tenant?.id?.toString() ?? ""
    );

  const handleCloseSession = () => {
    // Redirect to attendance dashboard after closing
    router.push("/management/training-attendance");
  };

  const handleDeleteSession = () => {
    // Redirect to attendance dashboard after deletion
    router.push("/management/training-attendance");
  };

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sessionData || !tenant) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Session Not Found"
          description="The attendance session you're looking for doesn't exist"
          backButton={{
            href: "/management/training-attendance",
            label: "Back to Attendance",
          }}
        />
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Session Not Found</h3>
          <p className="text-sm text-muted-foreground">
            The attendance session you&apos;re looking for doesn&apos;t exist or
            has been closed.
          </p>
        </div>
      </div>
    );
  }

  const session = sessionData.session;
  const isActive = sessionData.id !== null; // Active sessions have an ID

  return (
    <div className="space-y-4">
      <PageHeader
        title="Attendance Session"
        description="View and manage attendance records"
        backButton={{
          href: "/management/training-attendance",
          label: "Back to Attendance",
        }}
        actions={
          <div className="flex gap-2 items-center">
            {!isActive ? (
              <Badge
                variant="secondary"
                className="h-10 px-4 flex items-center text-sm"
              >
                Session Closed
              </Badge>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/management/training-attendance/${params.id}/check-in`
                    )
                  }
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Check In
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/management/training-attendance/${params.id}/add-pin`
                    )
                  }
                >
                  <Key className="h-4 w-4 mr-2" />
                  Create PIN
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsConfirmCloseOpen(true)}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Close Session
                </Button>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setIsConfirmDeleteOpen(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Session
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        }
      />

      {/* Session details */}
      <div className="space-y-1 mb-4">
        <p className="text-sm text-muted-foreground">
          {session?.date && format(new Date(session.date), "MMMM d, yyyy")}
        </p>
        <p className="text-sm text-muted-foreground">
          {session?.startTime && session?.endTime && (
            <>
              {format(new Date(`2000-01-01T${session.startTime}`), "h:mm a")} -{" "}
              {format(new Date(`2000-01-01T${session.endTime}`), "h:mm a")}
            </>
          )}
        </p>
      </div>

      {/* Use the AttendanceSessionManager for all attendance functionality */}
      <AttendanceSessionManager
        sessionId={sessionId}
        tenant={tenant}
        onClose={handleCloseSession}
        onDelete={handleDeleteSession}
        isConfirmCloseOpen={isConfirmCloseOpen}
        setIsConfirmCloseOpen={setIsConfirmCloseOpen}
        isConfirmDeleteOpen={isConfirmDeleteOpen}
        setIsConfirmDeleteOpen={setIsConfirmDeleteOpen}
        onCloseSession={handleCloseSession}
        onDeleteSession={handleDeleteSession}
      />
    </div>
  );
}
