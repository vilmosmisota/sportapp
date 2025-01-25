"use client";

import { useParams, useRouter } from "next/navigation";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import {
  useAttendanceSessionById,
  useAttendanceRecords,
} from "@/entities/attendance/Attendance.query";
import { usePlayersByTeamId } from "@/entities/team/Team.query";
import {
  Loader2,
  UserCheck,
  Key,
  RefreshCw,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { DataTablePagination } from "@/components/ui/data-table/DataTablePagination";
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
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AttendanceStatus } from "@/entities/attendance/Attendance.schema";
import {
  useCloseAttendanceSession,
  useReopenAttendanceSession,
  useDeleteAttendanceSession,
} from "@/entities/attendance/Attendance.actions.client";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { data: tenant } = useTenantByDomain(params.domain as string);
  const closeSession = useCloseAttendanceSession();
  const reopenSession = useReopenAttendanceSession();
  const deleteSession = useDeleteAttendanceSession();
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);
  const [isConfirmReopenOpen, setIsConfirmReopenOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const queryClient = useQueryClient();

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
          return <Badge variant="secondary">Absent</Badge>;
        }

        if (status === AttendanceStatus.LATE) {
          return <Badge variant="destructive">Late</Badge>;
        }

        if (status === AttendanceStatus.PRESENT) {
          return <Badge variant="default">Present</Badge>;
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

  const records: PlayerAttendanceRow[] =
    data?.map((record) => ({
      id: record.id,
      attendanceSessionId: record.attendanceSessionId,
      playerId: record.playerId,
      tenantId: record.tenantId,
      checkInTime: record.checkInTime,
      status: record.status,
      player: record.player
        ? {
            firstName: record.player.firstName,
            lastName: record.player.lastName,
            pin: record.player.pin,
          }
        : null,
    })) ?? [];

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

      await closeSession.mutateAsync({
        sessionId: Number(params.id),
        tenantId: tenant?.id?.toString() ?? "",
        notCheckedInPlayerIds,
      });
      // Manually refetch the session data to update UI
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            queryKeys.attendance.detail(
              tenant?.id?.toString() ?? "",
              params.id as string
            ),
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: [queryKeys.attendance.records],
        }),
      ]);
      toast.success("Session closed successfully");
    } catch (error) {
      console.error("Error closing session:", error);
      toast.error("Failed to close attendance session");
    }
  };

  const handleReopenSession = async () => {
    try {
      await reopenSession.mutateAsync({
        sessionId: Number(params.id),
        tenantId: tenant?.id?.toString() ?? "",
      });
      // Manually refetch the session data to update UI
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            queryKeys.attendance.detail(
              tenant?.id?.toString() ?? "",
              params.id as string
            ),
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: [queryKeys.attendance.records],
        }),
      ]);
      toast.success("Session reopened successfully");
    } catch (error) {
      console.error("Error reopening session:", error);
      toast.error("Failed to reopen session");
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Calculate statistics
  const totalPlayers = data.length;
  const presentPlayers = data.filter(
    (record) => record.status === AttendanceStatus.PRESENT
  ).length;
  const latePlayers = data.filter(
    (record) => record.status === AttendanceStatus.LATE
  ).length;
  const absentPlayers = totalPlayers - presentPlayers - latePlayers;
  const attendanceRate = ((presentPlayers + latePlayers) / totalPlayers) * 100;

  // Get the first and last check-in times
  const checkInTimes = data
    .map((record) => record.checkInTime)
    .filter((time): time is string => time !== null)
    .map((time) => {
      // If time is in HH:mm:ss format, parse it as today's date with that time
      if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
        const [hours, minutes] = time.split(":");
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        date.setSeconds(0);
        return date;
      }
      // Otherwise try to parse as date
      return new Date(time);
    })
    .sort((a, b) => a.getTime() - b.getTime());

  const firstCheckIn = checkInTimes[0];
  const lastCheckIn = checkInTimes[checkInTimes.length - 1];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Attendance Session
          </h2>
          <p className="text-sm text-muted-foreground">
            {session?.training?.date &&
              format(new Date(session.training.date), "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {!session?.isActive ? (
            <>
              <Badge
                variant="secondary"
                className="h-10 px-4 flex items-center text-sm"
              >
                Session Closed
              </Badge>
              <Button
                variant="outline"
                onClick={() => setIsConfirmReopenOpen(true)}
                disabled={reopenSession.isPending}
              >
                {reopenSession.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reopening...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reopen Session
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/o/dashboard/attendance/${params.id}/check-in`)
                }
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Check In
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/o/dashboard/attendance/${params.id}/add-pin`)
                }
              >
                <Key className="h-4 w-4 mr-2" />
                Create PIN
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsConfirmCloseOpen(true)}
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
            </>
          )}
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
        </div>
      </div>

      {!session?.isActive && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                Attendance Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {attendanceRate.toFixed(0)}%
                </span>
                <span className="text-sm text-muted-foreground">
                  ({presentPlayers + latePlayers}/{totalPlayers})
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                Attendance Breakdown
              </span>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5">
                  <Badge variant="default" className="h-2 w-2 p-0" />
                  <span className="text-sm">{presentPlayers} Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="destructive" className="h-2 w-2 p-0" />
                  <span className="text-sm">{latePlayers} Late</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="h-2 w-2 p-0" />
                  <span className="text-sm">{absentPlayers} Absent</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                First Check-in
              </span>
              <span className="text-2xl font-bold">
                {firstCheckIn ? format(firstCheckIn, "HH:mm") : "-"}
              </span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                Last Check-in
              </span>
              <span className="text-2xl font-bold">
                {lastCheckIn ? format(lastCheckIn, "HH:mm") : "-"}
              </span>
            </div>
          </Card>
        </div>
      )}

      <DataTable table={table} columns={columns} data={data} />

      <ConfirmDeleteDialog
        isOpen={isConfirmCloseOpen}
        setIsOpen={setIsConfirmCloseOpen}
        onConfirm={() => handleCloseSession()}
        categoryId={params.id as string}
        text="This will close the attendance session. You won't be able to record any more check-ins after this. Are you sure?"
        buttonText="Close Session"
      />

      <ConfirmDeleteDialog
        isOpen={isConfirmReopenOpen}
        setIsOpen={setIsConfirmReopenOpen}
        onConfirm={() => handleReopenSession()}
        categoryId={params.id as string}
        text="This will reopen the attendance session. Players will be able to check in again. Are you sure?"
        buttonText="Reopen Session"
      />

      <ConfirmDeleteDialog
        isOpen={isConfirmDeleteOpen}
        setIsOpen={setIsConfirmDeleteOpen}
        onConfirm={() => handleDeleteSession()}
        categoryId={params.id as string}
        text="This will permanently delete the attendance session and all associated records. This action cannot be undone. Are you sure?"
        buttonText="Delete Session"
      />
    </div>
  );
}
