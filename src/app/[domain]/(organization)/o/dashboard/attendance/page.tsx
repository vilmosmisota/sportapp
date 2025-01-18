"use client";

import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useTrainingsByDayRange } from "@/entities/training/Training.query";
import { useActiveAttendanceSessions } from "@/entities/attendance/Attendance.query";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, CalendarClock } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useUserRoles } from "@/entities/user/hooks/useUserRoles";
import { Permissions } from "@/libs/permissions/permissions";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { format, isToday, isFuture, parseISO, isPast } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Training } from "@/entities/training/Training.schema";
import {
  useCreateAttendanceSession,
  useCloseAttendanceSession,
} from "@/entities/attendance/Attendance.actions.client";
import { toast } from "sonner";
import Link from "next/link";

function formatTimeString(timeStr: string) {
  try {
    // Create a date object for today with the given time
    const today = new Date();
    const [hours, minutes] = timeStr.split(":");
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      parseInt(hours),
      parseInt(minutes)
    );
    return format(date, "h:mm a");
  } catch (error) {
    console.error("Error parsing time:", error);
    return timeStr;
  }
}

export default function AttendancePage({
  params,
}: {
  params: { domain: string };
}) {
  const { data: tenant, isLoading: isTenantLoading } = useTenantByDomain(
    params.domain
  );
  const { data: trainings, isLoading: isTrainingsLoading } =
    useTrainingsByDayRange(
      tenant?.id?.toString() ?? "",
      8 // Fetch trainings for the next 7 days
    );
  const { data: activeSessions } = useActiveAttendanceSessions(
    tenant?.id?.toString() ?? ""
  );
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const userEntity = useUserRoles();
  const canManageAttendance = Permissions.Attendance.manage(userEntity);

  const isLoading = isTenantLoading || isTrainingsLoading;

  // Get all upcoming trainings sorted by date
  const upcomingTrainings =
    trainings
      ?.filter((training) => isFuture(training.date))
      .sort((a, b) => a.date.getTime() - b.date.getTime()) ?? [];

  // Get past trainings with active sessions
  const pastTrainingsWithActiveSessions =
    trainings
      ?.filter(
        (training) =>
          isPast(training.date) &&
          activeSessions?.some((session) => session.trainingId === training.id)
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime()) ?? [];

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
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold tracking-tight">
              Attendance
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage attendance for upcoming training sessions.
            </p>
          </div>
          {canManageAttendance && upcomingTrainings.length > 0 && (
            <Button
              onClick={() => setIsCreateSessionOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Session
            </Button>
          )}
        </div>

        {/* Upcoming Trainings */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Upcoming Trainings</h4>
          {upcomingTrainings.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-muted-foreground" />
                  No Upcoming Trainings
                </CardTitle>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingTrainings.map((training) => (
                <TrainingCard
                  key={training.id}
                  training={training}
                  activeSessionId={
                    activeSessions?.find(
                      (session) => session.trainingId === training.id
                    )?.id
                  }
                  hasActiveSession={
                    activeSessions?.some(
                      (session) => session.trainingId === training.id
                    ) ?? false
                  }
                  tenantId={tenant.id.toString()}
                  canManageAttendance={canManageAttendance}
                  isPastTraining={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Past Trainings with Active Sessions */}
        {pastTrainingsWithActiveSessions.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              Past Trainings with Active Sessions
            </h4>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastTrainingsWithActiveSessions.map((training) => (
                <TrainingCard
                  key={training.id}
                  training={training}
                  activeSessionId={
                    activeSessions?.find(
                      (session) => session.trainingId === training.id
                    )?.id
                  }
                  hasActiveSession={true}
                  tenantId={tenant.id.toString()}
                  canManageAttendance={canManageAttendance}
                  isPastTraining={true}
                />
              ))}
            </div>
          </div>
        )}

        <ResponsiveSheet
          isOpen={isCreateSessionOpen}
          setIsOpen={setIsCreateSessionOpen}
          title="Create Attendance Session"
        >
          <div className="p-4">
            {/* TODO: Add CreateSessionForm component */}
          </div>
        </ResponsiveSheet>
      </div>
    </ErrorBoundary>
  );
}

function TrainingCard({
  training,
  hasActiveSession,
  tenantId,
  canManageAttendance,
  activeSessionId,
  isPastTraining,
}: {
  training: Training;
  hasActiveSession: boolean;
  tenantId: string;
  canManageAttendance: boolean;
  activeSessionId: number | undefined;
  isPastTraining: boolean;
}) {
  const createSession = useCreateAttendanceSession();
  const closeSession = useCloseAttendanceSession();

  const handleStartSession = async () => {
    try {
      await createSession.mutateAsync({
        trainingId: training.id,
        tenantId,
        endTime: training.endTime,
        seasonId: training.trainingSeasonConnections[0]?.seasonId ?? 1,
      });
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create attendance session");
    }
  };

  const handleCloseSession = async () => {
    if (!activeSessionId) return;
    try {
      await closeSession.mutateAsync({
        sessionId: activeSessionId,
        tenantId,
      });
      toast.success("Session closed successfully");
    } catch (error) {
      console.error("Error closing session:", error);
      toast.error("Failed to close attendance session");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {training.team?.age} {training.team?.gender} {training.team?.skill}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(training.date, "EEEE, MMMM d")}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Time:</span>
          <span className="font-medium">
            {formatTimeString(training.startTime)} -{" "}
            {formatTimeString(training.endTime)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Location:</span>
          <span className="font-medium">{training.location?.name}</span>
        </div>
        {hasActiveSession && canManageAttendance && (
          <div className="pt-4 space-y-2">
            <Link href={`/o/dashboard/attendance/${activeSessionId}`}>
              <Button variant="secondary" className="w-full">
                View Active Session
              </Button>
            </Link>
            {isPastTraining && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleCloseSession}
                disabled={closeSession.isPending}
              >
                {closeSession.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Closing...
                  </>
                ) : (
                  "Close Session"
                )}
              </Button>
            )}
          </div>
        )}
        {!hasActiveSession && canManageAttendance && !isPastTraining && (
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleStartSession}
              disabled={createSession.isPending}
            >
              {createSession.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                "Start Session"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
