"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Components
import { ActiveSessionsCarousel } from "./components/ActiveSessionsCarousel";
import { UpcomingAttendanceCarousel } from "./components/UpcomingAttendanceCarousel";

// Data fetching
import { useActiveAttendanceSessions } from "@/entities/attendance/ActiveAttendanceSession.query";
import { useSessionsByTenantForDays } from "@/entities/session/Session.query";
import { SessionWithGroup } from "@/entities/session/Session.schema";
import { TenantGroupsConfig } from "@/entities/tenant/Tenant.schema";

// Actions
import {
  useCloseActiveAttendanceSession,
  useCreateActiveAttendanceSession,
} from "@/entities/attendance/ActiveAttendanceSession.actions.client";

interface AttendanceManagerProps {
  tenantId: string;
  tenantGroupsConfig?: TenantGroupsConfig;
}

export function AttendanceManager({
  tenantId,
  tenantGroupsConfig,
}: AttendanceManagerProps) {
  // Data fetching
  const { data: sessions, isLoading: isSessionsLoading } =
    useSessionsByTenantForDays(tenantId, 7); // Fetch sessions for the next 7 days

  const { data: activeSessions } = useActiveAttendanceSessions(tenantId);

  // Mutations for starting and closing sessions
  const createSession = useCreateActiveAttendanceSession();
  const closeSession = useCloseActiveAttendanceSession();

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
        (activeSession) => activeSession.sessionId === session.id
      ) && !session.isAggregated
  );

  // Get upcoming sessions without active sessions
  const upcomingSessionsWithoutActiveSessions = upcomingSessions.filter(
    (session) =>
      !activeSessions?.some(
        (activeSession) => activeSession.sessionId === session.id
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
            (activeSession) => activeSession.sessionId === session.id
          ) &&
          !session.isAggregated
        );
      })
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ) ?? [];

  const allActiveSessionSessions = [
    ...upcomingSessionsWithActiveSessions,
    ...pastSessionsWithActiveSessions,
  ];

  const getActiveSessionId = (sessionId: number) => {
    return activeSessions?.find(
      (activeSession) => activeSession.sessionId === sessionId
    )?.id;
  };

  const isPastSession = (session: SessionWithGroup) => {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessionDate < today;
  };

  // Handler for starting a session
  const handleStartSession = async (
    session: SessionWithGroup
  ): Promise<void> => {
    try {
      await createSession.mutateAsync({
        session,
        tenantId,
      });
      toast.success("Attendance session started successfully");
    } catch (error) {
      console.error("Error starting attendance session:", error);
      toast.error("Failed to start attendance session");
    }

    return Promise.resolve();
  };

  // Handler for closing a session
  const handleCloseSession = async (sessionId: number): Promise<void> => {
    try {
      await closeSession.mutateAsync({
        sessionId,
        tenantId,
      });
      toast.success("Attendance session closed successfully");
    } catch (error) {
      console.error("Error closing attendance session:", error);
      toast.error("Failed to close attendance session");
    }

    return Promise.resolve();
  };

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming sessions carousel */}
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
          onStartSession={handleStartSession}
          isStartingSession={createSession.isPending}
          tenantId={tenantId}
          tenantGroupsConfig={tenantGroupsConfig}
        />
      ) : (
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <h3 className="text-lg font-medium mb-2">No Upcoming Sessions</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                There are no sessions scheduled for the next 7 days. Once
                sessions are scheduled, they will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
          onCloseSession={handleCloseSession}
          isClosingSession={closeSession.isPending}
          tenantId={tenantId}
          tenantGroupsConfig={tenantGroupsConfig}
        />
      ) : (
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <h3 className="text-lg font-medium mb-2">No Active Sessions</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                There are no active attendance sessions at the moment.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
