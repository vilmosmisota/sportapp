"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Components
import { Card, CardContent } from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { ActiveSessionsCarousel } from "./components/ActiveSessionsCarousel";
import { ConfirmCloseDialog } from "./components/ConfirmCloseDialog";
import { UpcomingAttendanceCarousel } from "./components/UpcomingAttendanceCarousel";

// Data fetching
import {
  useActiveAttendanceSessions,
  useAttendanceRecords,
} from "@/entities/old-attendance/Attendance.query";

// Actions
import {
  useCloseAttendanceSession,
  useCreateAttendanceSession,
} from "@/entities/old-attendance/Attendance.actions.client";

// Types
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { useSessionsByTenantForDays } from "@/entities/session/Session.query";
import { SessionWithGroup } from "@/entities/session/Session.schema";

export default function AttendancePage() {
  const { tenant } = useTenantAndUserAccessContext();

  const { data: sessions, isLoading: isSessionsLoading } =
    useSessionsByTenantForDays(
      tenant?.id?.toString() ?? "",
      7 // Fetch sessions for the next 7 days
    );
  const { data: activeSessions } = useActiveAttendanceSessions(
    tenant?.id?.toString() ?? ""
  );

  const createSession = useCreateAttendanceSession();
  const closeSession = useCloseAttendanceSession();

  // Track which session is being closed
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );

  // Get records for the selected session
  const { data: records } = useAttendanceRecords(
    selectedSessionId ?? 0,
    tenant?.id?.toString() ?? ""
  );

  const isLoading = isSessionsLoading;

  // Get all upcoming sessions sorted by date
  const upcomingSessions =
    sessions
      ?.filter((session) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);

        return sessionDate >= today && !session.isAggregated;
      })
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ) ?? [];

  // Get upcoming sessions with active sessions
  const upcomingSessionsWithActiveSessions = upcomingSessions.filter(
    (session) =>
      activeSessions?.some(
        (activeSession) => activeSession.trainingId === session.id
      ) && !session.isAggregated
  );

  // Get upcoming sessions without active sessions
  const upcomingSessionsWithoutActiveSessions = upcomingSessions.filter(
    (session) =>
      !activeSessions?.some(
        (activeSession) => activeSession.trainingId === session.id
      ) && !session.isAggregated
  );

  // Get past sessions with active sessions
  const pastSessionsWithActiveSessions =
    sessions
      ?.filter((session) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);

        return (
          sessionDate < today &&
          activeSessions?.some(
            (activeSession) => activeSession.trainingId === session.id
          ) &&
          !session.isAggregated
        );
      })
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ) ?? [];

  // Combine all active sessions (both upcoming and past)
  const allActiveSessionSessions = [
    ...upcomingSessionsWithActiveSessions,
    ...pastSessionsWithActiveSessions,
  ];

  const getActiveSessionId = (sessionId: number) => {
    return activeSessions?.find(
      (activeSession) => activeSession.trainingId === sessionId
    )?.id;
  };

  const isPastSession = (session: SessionWithGroup) => {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessionDate < today;
  };

  const handleStartSessionFromCarousel = async (session: SessionWithGroup) => {
    try {
      await createSession.mutateAsync({
        trainingId: session.id,
        tenantId: tenant?.id.toString() ?? "",
        endTime: session.endTime,
        seasonId: session.seasonId,
      });
      toast.success("Attendance session created successfully");
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create attendance session");
    }
  };

  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  // Simplified handler for closing session
  const handleCloseSessionFromCarousel = async (sessionId: number) => {
    if (!tenant) return;
    setSelectedSessionId(sessionId);
    setIsCloseDialogOpen(true);
  };

  // Simplified close session handler
  const handleConfirmCloseSession = async () => {
    if (!selectedSessionId || !tenant) return;

    setPendingClose(true);
    try {
      await closeSession.mutateAsync({
        sessionId: selectedSessionId,
        tenantId: tenant.id.toString(),
        notCheckedInPlayerIds: [], // Skip player check-in for now
      });
      toast.success("Session closed successfully");
      setIsCloseDialogOpen(false);
      setSelectedSessionId(null);
    } catch (error) {
      console.error("Error closing session:", error);
      toast.error("Failed to close attendance session");
    } finally {
      setPendingClose(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

        {/* Active sessions carousel */}
        {isLoading ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-7 w-40 bg-muted rounded animate-pulse"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 w-full bg-muted rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        ) : allActiveSessionSessions.length > 0 ? (
          <ActiveSessionsCarousel
            sessions={allActiveSessionSessions}
            getActiveSessionId={getActiveSessionId}
            isPastSession={isPastSession}
            onCloseSession={handleCloseSessionFromCarousel}
            isClosingSession={closeSession.isPending}
            tenantId={tenant?.id.toString() ?? ""}
          />
        ) : (
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <h3 className="text-lg font-medium mb-2">No Active Sessions</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  There are no active attendance sessions at the moment. Start a
                  session for an upcoming training to track attendance.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming sessions without active sessions */}
        {isLoading ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-7 w-40 bg-muted rounded animate-pulse"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 w-full bg-muted rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        ) : upcomingSessionsWithoutActiveSessions.length > 0 ? (
          <UpcomingAttendanceCarousel
            sessions={upcomingSessionsWithoutActiveSessions}
            onStartSession={handleStartSessionFromCarousel}
            isStartingSession={createSession.isPending}
            tenantId={tenant?.id.toString() ?? ""}
          />
        ) : (
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <h3 className="text-lg font-medium mb-2">
                  No Upcoming Sessions
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  There are no sessions scheduled for the next 7 days. Once
                  sessions are scheduled, they will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <ConfirmCloseDialog
          isOpen={isCloseDialogOpen}
          setIsOpen={setIsCloseDialogOpen}
          onConfirm={handleConfirmCloseSession}
          isPending={pendingClose || closeSession.isPending}
        />
      </div>
    </ErrorBoundary>
  );
}
