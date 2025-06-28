"use client";

import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// New attendance system imports
import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useDeleteActiveAttendanceSession } from "@/entities/attendance/ActiveAttendanceSession.actions.client";
import {
  useAggregateAndCleanupAttendanceSession,
  useUpdateAttendanceRecords,
} from "@/entities/attendance/ActiveAttendanceSessionWithRecords.actions.client";
import { AttendanceStatus } from "@/entities/attendance/AttendanceRecord.schema";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { useAttendanceSessionData } from "./hooks/useAttendanceSessionData";
import { getNotCheckedInPerformers } from "./utils/transformAttendanceData";

// Components
import { ManageAttendanceForm } from "./components/ActiveSessionManagingForm";
import { AttendanceSessionTable } from "./components/ActiveSessionTable";
import { AddGuestPlayerForm } from "./components/AddGuestPlayerForm";
import { AttendanceSummary } from "./components/AttendanceSummary";
import { ConfirmCloseDialog } from "./components/ConfirmCloseDialog";
import { PinManagementForm } from "./components/PinManagementForm";

interface AttendanceSessionManagerProps {
  sessionId: number;
  tenant: Tenant;
  onClose?: () => void;
  onDelete?: () => void;
  onManageAttendance?: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  // Expose dialog controls to parent
  isConfirmCloseOpen?: boolean;
  setIsConfirmCloseOpen?: (open: boolean) => void;
  isConfirmDeleteOpen?: boolean;
  setIsConfirmDeleteOpen?: (open: boolean) => void;
  onCloseSession?: () => void;
  onDeleteSession?: () => void;
}

export function AttendanceSessionManager({
  sessionId,
  tenant,
  onClose,
  onDelete,
  onManageAttendance,
  onRefreshData,
  isRefreshing = false,
  isConfirmCloseOpen = false,
  setIsConfirmCloseOpen,
  isConfirmDeleteOpen = false,
  setIsConfirmDeleteOpen,
  onCloseSession,
  onDeleteSession,
}: AttendanceSessionManagerProps) {
  const tenantId = tenant.id.toString();
  const router = useRouter();

  // State management
  const [isManageAttendanceOpen, setIsManageAttendanceOpen] = useState(false);
  const [isManagePinsOpen, setIsManagePinsOpen] = useState(false);
  const [isAddGuestPlayerOpen, setIsAddGuestPlayerOpen] = useState(false);

  const queryClient = useQueryClient();

  // Data fetching
  const { session, attendanceRows, isLoading } = useAttendanceSessionData(
    sessionId,
    tenantId
  );

  // Mutations
  const aggregateSession = useAggregateAndCleanupAttendanceSession(tenantId);
  const deleteSession = useDeleteActiveAttendanceSession();
  const updateAttendanceStatuses = useUpdateAttendanceRecords(
    sessionId,
    tenantId
  );

  const handleCloseSession = async () => {
    try {
      const notCheckedInPerformerIds =
        getNotCheckedInPerformers(attendanceRows);

      await aggregateSession.mutateAsync({
        sessionId,
        notCheckedInMemberIds: notCheckedInPerformerIds,
      });

      const sessionDate = session?.session?.date;
      const sessionTime =
        session?.session?.startTime && session?.session?.endTime
          ? `${session.session.startTime} - ${session.session.endTime}`
          : undefined;
      const totalAttendees = attendanceRows.length;
      const checkedInCount = attendanceRows.filter((row) => row.status).length;

      const params = new URLSearchParams();
      if (sessionDate) params.set("date", sessionDate);
      if (sessionTime) params.set("time", sessionTime);
      params.set("attendees", totalAttendees.toString());
      params.set("checkedIn", checkedInCount.toString());

      router.push(
        `/attendance/live-sessions/session-closed?${params.toString()}`
      );
      toast.success("Session closed and data aggregated successfully");
      onClose?.();
    } catch (error) {
      console.error("Error closing session:", error);

      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Failed to close attendance session");
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.activeSessions(tenantId),
      });
    } finally {
      setIsConfirmCloseOpen?.(false);
    }
  };

  const handleDeleteSession = async () => {
    try {
      await deleteSession.mutateAsync({
        sessionId,
        tenantId,
      });
      toast.success("Session deleted successfully");
      onDelete?.();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete attendance session");
    } finally {
      setIsConfirmDeleteOpen?.(false);
    }
  };

  const handleGoToKiosk = () => {
    router.push(`/attendance/live-sessions/${sessionId}/kiosk`);
  };

  const handleAddGuestPlayer = async (
    playerId: number,
    status: AttendanceStatus
  ) => {
    try {
      await updateAttendanceStatuses.mutateAsync([
        { performerId: playerId, status },
      ]);

      toast.success("Guest player added successfully");

      await handleRefreshData();
    } catch (error) {
      console.error("Error adding guest player:", error);
      throw error;
    }
  };

  const handleUpdateAttendance = async (
    records: { performerId: number; status: AttendanceStatus | null }[]
  ) => {
    await updateAttendanceStatuses.mutateAsync(records);
  };

  const handleRefreshData = async () => {
    try {
      // Invalidate all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.attendance.activeSessions(tenantId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.attendance.records(
            tenantId,
            sessionId.toString()
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.member.byGroup(
            tenantId,
            session?.session?.groupId
          ),
        }),
      ]);

      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Session not found
  if (!session) {
    return (
      <div className="space-y-4">
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

  const isSessionActive = session.id !== null; // Active sessions have an ID

  return (
    <div className="space-y-4">
      {/* Attendance table with integrated summary */}
      <AttendanceSessionTable
        attendanceRecords={attendanceRows}
        session={session}
        isLoading={false}
        onManageAttendance={() => {
          setIsManageAttendanceOpen(true);
          onManageAttendance?.();
        }}
        onManagePins={() => {
          setIsManagePinsOpen(true);
        }}
        onRefreshData={onRefreshData || handleRefreshData}
        isRefreshing={isRefreshing}
        summaryComponent={
          <AttendanceSummary attendanceRows={attendanceRows} tenant={tenant} />
        }
        onCloseSession={() => setIsConfirmCloseOpen?.(true)}
        onDeleteSession={() => setIsConfirmDeleteOpen?.(true)}
        onGoToKiosk={handleGoToKiosk}
        onAddGuestPlayer={() => setIsAddGuestPlayerOpen(true)}
        isSessionActive={isSessionActive}
      />

      {/* Confirmation dialogs */}
      <ConfirmCloseDialog
        isOpen={isConfirmCloseOpen}
        setIsOpen={setIsConfirmCloseOpen || (() => {})}
        onConfirm={onCloseSession || handleCloseSession}
        isPending={aggregateSession.isPending}
        notCheckedInCount={getNotCheckedInPerformers(attendanceRows).length}
        totalAttendees={attendanceRows.length}
        sessionDate={session?.session?.date}
        sessionTime={
          session?.session?.startTime && session?.session?.endTime
            ? `${session.session.startTime} - ${session.session.endTime}`
            : undefined
        }
      />

      <ConfirmDeleteDialog
        isOpen={isConfirmDeleteOpen}
        setIsOpen={setIsConfirmDeleteOpen || (() => {})}
        onConfirm={onDeleteSession || handleDeleteSession}
        categoryId={sessionId.toString()}
        text="This will permanently delete the attendance session and all associated records. This action cannot be undone. Are you sure?"
        buttonText="Delete Session"
      />

      {/* Manage Attendance Form */}
      <ResponsiveSheet
        isOpen={isManageAttendanceOpen}
        setIsOpen={setIsManageAttendanceOpen}
        title="Manage Attendance"
      >
        <ManageAttendanceForm
          attendanceRecords={attendanceRows}
          session={session}
          tenantId={tenantId}
          sessionId={sessionId}
          setIsOpen={setIsManageAttendanceOpen}
          onUpdateAttendance={handleUpdateAttendance}
          isPending={updateAttendanceStatuses.isPending}
        />
      </ResponsiveSheet>

      {/* Manage PINs Form */}
      <ResponsiveSheet
        isOpen={isManagePinsOpen}
        setIsOpen={setIsManagePinsOpen}
        title="Manage PINs"
      >
        <PinManagementForm
          attendanceRecords={attendanceRows}
          tenantId={tenantId}
          groupId={session.session?.groupId}
          setIsOpen={setIsManagePinsOpen}
        />
      </ResponsiveSheet>

      {/* Add Guest Player Form */}
      <ResponsiveSheet
        isOpen={isAddGuestPlayerOpen}
        setIsOpen={setIsAddGuestPlayerOpen}
        title="Add Guest Player"
      >
        <AddGuestPlayerForm
          tenantId={tenantId}
          currentGroupId={session.session?.groupId || 0}
          sessionId={sessionId}
          setIsOpen={setIsAddGuestPlayerOpen}
          onAddGuestPlayer={handleAddGuestPlayer}
          isPending={updateAttendanceStatuses.isPending}
        />
      </ResponsiveSheet>
    </div>
  );
}
