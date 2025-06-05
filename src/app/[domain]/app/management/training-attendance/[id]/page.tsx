"use client";

import { queryKeys } from "@/cacheKeys/cacheKeys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { DataTable } from "@/components/ui/data-table/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/ui/page-header";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCloseAttendanceSession,
  useDeleteAttendanceSession,
  useUpdateAttendanceStatuses,
} from "@/entities/attendance/Attendance.actions.client";
import {
  useAttendanceRecords,
  useAttendanceSessionById,
} from "@/entities/attendance/Attendance.query";
import { AttendanceStatus } from "@/entities/attendance/Attendance.schema";
import { usePlayersByTeamId } from "@/entities/group/Group.query";
import { useQueryClient } from "@tanstack/react-query";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Archive,
  ClipboardEdit,
  Info,
  Key,
  Loader2,
  MoreVertical,
  RefreshCw,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useTenantAndUserAccessContext } from "../../../../../../../composites/auth/TenantAndUserAccessContext";
import { ConfirmCloseDialog } from "../components/ConfirmCloseDialog";
type PlayerAttendanceRow = {
  id: number;
  attendanceSessionId: number | null;
  playerId: number | null;
  tenantId: number | null;
  checkInTime: string | null;
  status: AttendanceStatus | null;
  player: {
    firstName: string;
    lastName: string;
    pin?: string | null;
  } | null;
};

export default function AttendanceSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { tenant } = useTenantAndUserAccessContext();
  const closeSession = useCloseAttendanceSession();

  const deleteSession = useDeleteAttendanceSession();
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isManageAttendanceOpen, setIsManageAttendanceOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: session, isLoading: isSessionLoading } =
    useAttendanceSessionById(params.id as string, tenant?.id?.toString() ?? "");

  const { data: attendanceRecords, isLoading: isRecordsLoading } =
    useAttendanceRecords(Number(params.id), tenant?.id?.toString() ?? "");

  const { data: playersConnections, isLoading: isPlayersLoading } =
    usePlayersByTeamId(
      session?.training?.teamId ?? 0,
      tenant?.id?.toString() ?? ""
    );

  const isLoading = isSessionLoading || isPlayersLoading || isRecordsLoading;

  const columns: ColumnDef<PlayerAttendanceRow>[] = [
    {
      accessorKey: "player",
      header: "Name",
      cell: ({ row }) => {
        const player = row.getValue("player") as PlayerAttendanceRow["player"];
        return (
          <div className="flex items-center gap-1">
            {player ? `${player.firstName} ${player.lastName}` : "-"}
            {player && !player.pin && (
              <Popover>
                <PopoverTrigger>
                  <Info className="h-4 w-4 text-yellow-500/70" />
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  No PIN set for this player
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "checkInTime",
      header: "Check-in Time",
      cell: ({ row }) => {
        const time = row.getValue("checkInTime") as string | null;
        if (!time) return "-";

        try {
          // If time is in HH:mm:ss format, parse it directly
          if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
            const [hours, minutes] = time.split(":");
            return `${hours}:${minutes}`;
          }
          // Otherwise try to parse as date
          return format(new Date(time), "HH:mm");
        } catch (error) {
          console.error("Invalid time format:", time);
          return time;
        }
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as AttendanceStatus | null;

        if (status === AttendanceStatus.ABSENT) {
          return <Badge variant="destructive">Absent</Badge>;
        }

        if (status === AttendanceStatus.LATE) {
          return (
            <Badge className="bg-amber-500 hover:bg-amber-600">Late</Badge>
          );
        }

        if (status === AttendanceStatus.PRESENT) {
          return (
            <Badge className="bg-emerald-500 hover:bg-emerald-600">
              Present
            </Badge>
          );
        }

        // No record/status
        return <Badge variant="secondary">Not Checked In</Badge>;
      },
    },
  ];

  const data: PlayerAttendanceRow[] = useMemo(() => {
    if (!playersConnections || !attendanceRecords) return [];

    return playersConnections.map((connection) => {
      const record = attendanceRecords.find(
        (r) => r.playerId === connection.player.id
      );

      return {
        id: connection.player.id,
        attendanceSessionId: record?.attendanceSessionId ?? null,
        playerId: record?.playerId ?? null,
        tenantId: record?.tenantId ?? null,
        checkInTime: record?.checkInTime ?? null,
        status: record?.status ?? null,
        player: {
          firstName: connection.player.firstName,
          lastName: connection.player.lastName,
          pin: connection.player.pin,
        },
      };
    });
  }, [playersConnections, attendanceRecords]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleCloseSession = async () => {
    try {
      // Get IDs of players who haven't checked in
      const notCheckedInPlayerIds = data
        .filter((record) => !record.status)
        .map((record) => record.id);

      // Set loading state (closeSession.isPending will be true during the mutation)
      await closeSession.mutateAsync({
        sessionId: Number(params.id),
        tenantId: tenant?.id?.toString() ?? "",
        notCheckedInPlayerIds,
      });

      // After successful closure and data aggregation, show success message
      toast.success("Session closed and data aggregated successfully");

      // Redirect to the attendance dashboard since this session no longer exists
      router.push(`/o/dashboard/training-attendance`);
    } catch (error) {
      console.error("Error closing session:", error);

      // Provide more specific error messages if possible
      if (error instanceof Error) {
        if (error.message.includes("Failed to aggregate")) {
          toast.error("Failed to aggregate attendance data. Please try again.");
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else {
        toast.error("Failed to close attendance session");
      }

      // Refresh the session data to ensure UI is in sync
      queryClient.invalidateQueries({
        queryKey: [
          queryKeys.attendance.detail(
            tenant?.id?.toString() ?? "",
            params.id as string
          ),
        ],
      });
    } finally {
      // Close the confirmation dialog
      setIsConfirmCloseOpen(false);
    }
  };

  const handleDeleteSession = async () => {
    try {
      await deleteSession.mutateAsync({
        sessionId: Number(params.id),
        tenantId: tenant?.id?.toString() ?? "",
      });
      toast.success("Session deleted successfully");
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete attendance session");
    }
  };

  // Add refresh function to invalidate queries and get fresh data
  const refreshData = async () => {
    try {
      setIsRefreshing(true);

      // Invalidate attendance session detail query
      await queryClient.invalidateQueries({
        queryKey: [
          queryKeys.attendance.detail(
            tenant?.id?.toString() ?? "",
            params.id as string
          ),
        ],
      });

      // Invalidate attendance records query
      await queryClient.invalidateQueries({
        queryKey: [
          queryKeys.attendance.records,
          Number(params.id),
          tenant?.id?.toString() ?? "",
        ],
      });

      // Invalidate team players query if we have a team ID
      if (session?.training?.teamId) {
        await queryClient.invalidateQueries({
          queryKey: [
            queryKeys.team.players(
              tenant?.id?.toString() ?? "",
              session.training.teamId
            ),
          ],
        });
      }

      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Attendance Session"
        description="View and manage attendance records"
        backButton={{
          href: /app/management/training-attendance",
          label: "Back to Attendance",
        }}
        actions={
          <div className="flex gap-2 items-center">
            {!session?.isActive ? (
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
                      `/o/dashboard/training-attendance/${params.id}/check-in`
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
                      `/o/dashboard/training-attendance/${params.id}/add-pin`
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

      <div className="space-y-1 mb-4">
        <p className="text-sm text-muted-foreground">
          {session?.training?.date &&
            format(new Date(session.training.date), "MMMM d, yyyy")}
        </p>
        <p className="text-sm text-muted-foreground">
          {session?.training?.startTime && session?.training?.endTime && (
            <>
              {format(
                new Date(`2000-01-01T${session.training.startTime}`),
                "h:mm a"
              )}{" "}
              -{" "}
              {format(
                new Date(`2000-01-01T${session.training.endTime}`),
                "h:mm a"
              )}
            </>
          )}
        </p>
      </div>

      {/* Table toolbar with secondary actions */}
      {session?.isActive && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsManageAttendanceOpen(true)}
              className="gap-2"
            >
              <ClipboardEdit className="h-4 w-4" />
              Manage Attendance
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      )}

      <DataTable table={table} columns={columns} data={data} />

      <ConfirmCloseDialog
        isOpen={isConfirmCloseOpen}
        setIsOpen={setIsConfirmCloseOpen}
        onConfirm={() => handleCloseSession()}
        isPending={closeSession.isPending}
      />

      <ConfirmDeleteDialog
        isOpen={isConfirmDeleteOpen}
        setIsOpen={setIsConfirmDeleteOpen}
        onConfirm={() => handleDeleteSession()}
        categoryId={params.id as string}
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
          attendanceRecords={data}
          session={session}
          tenantId={tenant?.id?.toString() ?? ""}
          sessionId={Number(params.id)}
          setIsOpen={setIsManageAttendanceOpen}
        />
      </ResponsiveSheet>
    </div>
  );
}

// Add the ManageAttendanceForm component
interface ManageAttendanceFormProps {
  attendanceRecords: PlayerAttendanceRow[];
  session: any;
  tenantId: string;
  sessionId: number;
  setIsOpen: (isOpen: boolean) => void;
}

function ManageAttendanceForm({
  attendanceRecords,
  session,
  tenantId,
  sessionId,
  setIsOpen,
}: ManageAttendanceFormProps) {
  const [playerAttendance, setPlayerAttendance] = useState<
    Record<number, AttendanceStatus | null>
  >(
    attendanceRecords.reduce((acc, record) => {
      acc[record.id] = record.status;
      return acc;
    }, {} as Record<number, AttendanceStatus | null>)
  );
  const queryClient = useQueryClient();
  const updateAttendanceStatuses = useUpdateAttendanceStatuses(
    sessionId,
    tenantId
  );

  // Special handling for "not checked in" status
  const NOT_CHECKED_IN = "not_checked_in";

  const handleStatusChange = (playerId: number, value: string) => {
    // If the special "not checked in" value is selected, set status to null
    // Otherwise, use the value as an attendance status
    const status =
      value === NOT_CHECKED_IN ? null : (value as AttendanceStatus);

    setPlayerAttendance((prev) => ({
      ...prev,
      [playerId]: status,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Convert the playerAttendance record to an array of records to update
      const recordsToUpdate = Object.entries(playerAttendance).map(
        ([playerIdStr, status]) => ({
          playerId: Number(playerIdStr),
          status,
        })
      );

      // Call the mutation
      await updateAttendanceStatuses.mutateAsync(recordsToUpdate);

      toast.success("Attendance records updated successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating attendance records:", error);
      toast.error("Failed to update attendance records");
    }
  };

  // Function to get display value for select
  const getSelectValue = (status: AttendanceStatus | null): string => {
    return status === null ? NOT_CHECKED_IN : status;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Attendance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Update attendance status for players who forgot to check in or
              need adjustment.
            </p>
            <div className="space-y-4">
              {attendanceRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">
                      {record.player?.firstName} {record.player?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {record.status && (
                        <span className="flex items-center gap-2">
                          Current status:&nbsp;
                          {record.status === AttendanceStatus.PRESENT && (
                            <Badge className="bg-emerald-500 hover:bg-emerald-600">
                              Present
                            </Badge>
                          )}
                          {record.status === AttendanceStatus.LATE && (
                            <Badge variant="destructive">Late</Badge>
                          )}
                          {record.status === AttendanceStatus.ABSENT && (
                            <Badge variant="outline">Absent</Badge>
                          )}
                        </span>
                      )}
                      {!record.status && "Not checked in"}
                    </p>
                  </div>
                  <div>
                    <Select
                      value={getSelectValue(playerAttendance[record.id])}
                      onValueChange={(value) =>
                        handleStatusChange(record.id, value)
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NOT_CHECKED_IN}>
                          Not checked in
                        </SelectItem>
                        <SelectItem value={AttendanceStatus.PRESENT}>
                          Present
                        </SelectItem>
                        <SelectItem value={AttendanceStatus.LATE}>
                          Late
                        </SelectItem>
                        <SelectItem value={AttendanceStatus.ABSENT}>
                          Absent
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateAttendanceStatuses.isPending}>
            {updateAttendanceStatuses.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
