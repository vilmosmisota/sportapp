"use client";

import { useParams } from "next/navigation";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import {
  useAttendanceSessionById,
  useAttendanceRecords,
} from "@/entities/attendance/Attendance.query";
import { usePlayersByTeamId } from "@/entities/team/Team.query";
import { Loader2 } from "lucide-react";
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
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Key, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface PlayerAttendanceRow {
  id: number;
  name: string;
  checkInTime: string | null;
  status: string | null;
  isLate: boolean | null;
}

export default function AttendanceSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: tenant } = useTenantByDomain(params.domain as string);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

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
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "checkInTime",
      header: "Check-in Time",
      cell: ({ row }) => {
        const time = row.getValue("checkInTime") as string | null;
        if (!time) return "-";
        try {
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
        const status = row.getValue("status") as string | null;
        const isLate = row.getValue("isLate") as boolean | null;

        if (!status) return <Badge variant="secondary">Not Checked In</Badge>;

        return (
          <Badge variant={isLate ? "destructive" : "default"}>
            {isLate ? "Late" : "On Time"}
          </Badge>
        );
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
        name: `${connection.player.firstName} ${connection.player.lastName}`,
        checkInTime: record?.checkInTime ?? null,
        status: record?.status ?? null,
        isLate: record?.isLate ?? null,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance Session</h1>
          <p className="text-muted-foreground">
            {session?.training?.date &&
              format(new Date(session.training.date), "PPP")}
            {session?.training?.startTime &&
              ` at ${session.training.startTime}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() =>
              router.push(`/o/dashboard/attendance/${params.id}/check-in`)
            }
          >
            <UserCheck className="h-4 w-4" />
            Check In
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() =>
              router.push(`/o/dashboard/attendance/${params.id}/add-pin`)
            }
          >
            <Key className="h-4 w-4" />
            Create PIN
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <DataTable table={table} columns={columns} data={data} />
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
