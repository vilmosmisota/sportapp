"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Components
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { UpcomingAttendanceCarousel } from "./components/UpcomingAttendanceCarousel";
import { ActiveSessionsCarousel } from "./components/ActiveSessionsCarousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmCloseDialog } from "./components/ConfirmCloseDialog";

// Data fetching
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useTrainingsByDayRange } from "@/entities/training/Training.query";
import { useActiveAttendanceSessions } from "@/entities/attendance/Attendance.query";
import { useAttendanceRecords } from "@/entities/attendance/Attendance.query";
import { usePlayersByTeamId } from "@/entities/team/Team.query";

// Actions
import {
  useCreateAttendanceSession,
  useCloseAttendanceSession,
} from "@/entities/attendance/Attendance.actions.client";

// Types
import { Training } from "@/entities/training/Training.schema";
import { useTenantAndUserAccessContext } from "../../../../../../components/auth/TenantAndUserAccessContext";

export default function AttendancePage() {
  const { tenant } = useTenantAndUserAccessContext();

  const { data: trainings, isLoading: isTrainingsLoading } =
    useTrainingsByDayRange(
      tenant?.id?.toString() ?? "",
      7 // Fetch trainings for the next 7 days
    );
  const { data: activeSessions } = useActiveAttendanceSessions(
    tenant?.id?.toString() ?? ""
  );

  const createSession = useCreateAttendanceSession();
  const closeSession = useCloseAttendanceSession();

  // We'll need to track which team we're working with for the close session function
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );

  // Move these hooks to the component level with conditional fetching
  const { data: players } = usePlayersByTeamId(
    selectedTeamId ?? 0,
    tenant?.id?.toString() ?? ""
  );

  const { data: records } = useAttendanceRecords(
    selectedSessionId ?? 0,
    tenant?.id?.toString() ?? ""
  );

  const isLoading = isTrainingsLoading;

  // Get all upcoming trainings sorted by date
  const upcomingTrainings =
    trainings
      ?.filter((training) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const trainingDate = new Date(training.date);
        trainingDate.setHours(0, 0, 0, 0);

        return trainingDate >= today && !training.isAggregated;
      })
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ) ?? [];

  // Get upcoming trainings with active sessions
  const upcomingTrainingsWithActiveSessions = upcomingTrainings.filter(
    (training) =>
      activeSessions?.some((session) => session.trainingId === training.id) &&
      !training.isAggregated
  );

  // Get upcoming trainings without active sessions
  const upcomingTrainingsWithoutActiveSessions = upcomingTrainings.filter(
    (training) =>
      !activeSessions?.some((session) => session.trainingId === training.id) &&
      !training.isAggregated
  );

  // Get past trainings with active sessions
  const pastTrainingsWithActiveSessions =
    trainings
      ?.filter((training) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const trainingDate = new Date(training.date);
        trainingDate.setHours(0, 0, 0, 0);

        return (
          trainingDate < today &&
          activeSessions?.some(
            (session) => session.trainingId === training.id
          ) &&
          !training.isAggregated
        );
      })
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ) ?? [];

  // Combine all active sessions (both upcoming and past)
  const allActiveSessionTrainings = [
    ...upcomingTrainingsWithActiveSessions,
    ...pastTrainingsWithActiveSessions,
  ];

  const getActiveSessionId = (trainingId: number) => {
    return activeSessions?.find((session) => session.trainingId === trainingId)
      ?.id;
  };

  const isPastTraining = (training: Training) => {
    const trainingDate = new Date(training.date);
    trainingDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return trainingDate < today;
  };

  const handleStartSessionFromCarousel = async (training: Training) => {
    try {
      await createSession.mutateAsync({
        trainingId: training.id,
        tenantId: tenant?.id.toString() ?? "",
        endTime: training.endTime,
        seasonId: training.seasonId,
      });
      toast.success("Attendance session created successfully");
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create attendance session");
    }
  };

  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  // Refactor handleCloseSessionFromCarousel to open dialog
  const handleCloseSessionFromCarousel = async (
    sessionId: number,
    teamId?: number
  ) => {
    if (!teamId || !tenant) return;
    setSelectedTeamId(teamId);
    setSelectedSessionId(sessionId);
    setIsCloseDialogOpen(true);
  };

  // Add the close session handler
  const handleConfirmCloseSession = async () => {
    if (
      !selectedTeamId ||
      !selectedSessionId ||
      !tenant ||
      !players ||
      !records
    )
      return;
    setPendingClose(true);
    try {
      const notCheckedInPlayerIds = players
        .filter((p) => !records.some((r) => r.playerId === p.player.id))
        .map((p) => p.player.id);
      await closeSession.mutateAsync({
        sessionId: selectedSessionId,
        tenantId: tenant.id.toString(),
        notCheckedInPlayerIds,
      });
      toast.success("Session closed successfully");
      setIsCloseDialogOpen(false);
      setSelectedTeamId(null);
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
        ) : allActiveSessionTrainings.length > 0 ? (
          <ActiveSessionsCarousel
            trainings={allActiveSessionTrainings}
            getActiveSessionId={getActiveSessionId}
            isPastTraining={isPastTraining}
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

        {/* Upcoming trainings without active sessions */}
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
        ) : upcomingTrainingsWithoutActiveSessions.length > 0 ? (
          <UpcomingAttendanceCarousel
            trainings={upcomingTrainingsWithoutActiveSessions}
            onStartSession={handleStartSessionFromCarousel}
            isStartingSession={createSession.isPending}
            tenantId={tenant?.id.toString() ?? ""}
          />
        ) : (
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <h3 className="text-lg font-medium mb-2">
                  No Upcoming Trainings
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  There are no trainings scheduled for the next 7 days. Once
                  trainings are scheduled, they will appear here.
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
