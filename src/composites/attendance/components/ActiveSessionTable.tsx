"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/DataTable";
import {
  AttendanceStatus,
  CheckInType,
} from "@/entities/attendance/AttendanceRecord.schema";
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
  Key,
  Loader2,
  Monitor,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { PerformerAttendanceRow } from "../utils/transformAttendanceData";

type AttendanceSessionTableProps = {
  attendanceRecords: PerformerAttendanceRow[];
  session: any;
  isLoading: boolean;
  onManageAttendance: () => void;
  onManagePins?: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  summaryComponent?: React.ReactNode;
  onCloseSession?: () => void;
  onDeleteSession?: () => void;
  onGoToKiosk?: () => void;
  onAddGuestPlayer?: () => void;
  isSessionActive?: boolean;
};

export function AttendanceSessionTable({
  attendanceRecords,
  session,
  isLoading,
  onManageAttendance,
  onManagePins,
  onRefreshData,
  isRefreshing,
  summaryComponent,
  onCloseSession,
  onDeleteSession,
  onGoToKiosk,
  onAddGuestPlayer,
  isSessionActive,
}: AttendanceSessionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<PerformerAttendanceRow>[] = [
    {
      accessorKey: "performer",
      header: "Name",
      cell: ({ row }) => {
        const performer = row.getValue(
          "performer"
        ) as PerformerAttendanceRow["performer"];
        return (
          <div className="flex items-center gap-1">
            {performer ? `${performer.firstName} ${performer.lastName}` : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "performer.pin",
      header: "PIN",
      cell: ({ row }) => {
        const performer = row.getValue(
          "performer"
        ) as PerformerAttendanceRow["performer"];
        return (
          <div className="font-mono text-sm">
            {performer?.pin ? performer.pin : "-"}
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
      accessorKey: "checkInType",
      header: "Check-in Type",
      cell: ({ row }) => {
        const checkInType = row.getValue("checkInType") as CheckInType | null;

        if (checkInType === CheckInType.SELF) {
          return (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              Self
            </Badge>
          );
        }

        if (checkInType === CheckInType.INSTRUCTOR) {
          return (
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200"
            >
              Instructor
            </Badge>
          );
        }

        // No check-in type (not checked in)
        return "-";
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

  const table = useReactTable({
    data: attendanceRecords,
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
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Table toolbar with secondary actions */}
      {session && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onManageAttendance}
              className="gap-2"
            >
              <ClipboardEdit className="h-4 w-4" />
              Manage Attendance
            </Button>
            {onManagePins && (
              <Button
                variant="outline"
                size="sm"
                onClick={onManagePins}
                className="gap-2"
              >
                <Key className="h-4 w-4" />
                Manage PINs
              </Button>
            )}
            {onGoToKiosk && (
              <Button
                variant="outline"
                size="sm"
                onClick={onGoToKiosk}
                className="gap-2"
              >
                <Monitor className="h-4 w-4" />
                Go to Check-in Hub
              </Button>
            )}
            {/* Hide Add Guest Player for now */}
            {/* {onAddGuestPlayer && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddGuestPlayer}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add Guest Player
              </Button>
            )} */}
          </div>
          <div className="flex gap-2">
            {isSessionActive && onCloseSession && (
              <Button
                variant="default"
                size="sm"
                onClick={onCloseSession}
                className="gap-2"
              >
                <Archive className="h-4 w-4" />
                Close Session
              </Button>
            )}
            {onDeleteSession && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteSession}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Session
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      )}

      {summaryComponent && <div className="mb-4">{summaryComponent}</div>}

      <DataTable table={table} columns={columns} data={attendanceRecords} />
    </>
  );
}
