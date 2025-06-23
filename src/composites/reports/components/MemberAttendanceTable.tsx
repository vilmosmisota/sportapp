import { DataTable } from "@/components/ui/data-table/DataTable";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import { Progress } from "@/components/ui/progress";
import { AttendanceRecordAggregate } from "@/entities/reports/AttendanceRecord.schema";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

interface MemberAttendanceTableProps {
  recordAggregates: AttendanceRecordAggregate[];
  "data-testid"?: string;
}

type MemberStats = {
  id: number;
  name: string;
  totalSessions: number;
  onTime: number;
  late: number;
  absent: number;
  attendanceRate: number;
  punctualityRate: number;
  performanceScore: number;
};

export function MemberAttendanceTable({
  recordAggregates,
  "data-testid": dataTestId,
}: MemberAttendanceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const data = useMemo(() => {
    return recordAggregates.map((record) => {
      const totalSessions =
        record.totalOnTime + record.totalLate + record.totalAbsent;

      // Calculate attendance rate (on-time + late / total)
      const attendanceRate =
        totalSessions > 0
          ? Math.round(
              ((record.totalOnTime + record.totalLate) / totalSessions) * 100
            )
          : 0;

      // Calculate punctuality rate (on-time / attended sessions)
      const attendedSessions = record.totalOnTime + record.totalLate;
      const punctualityRate =
        attendedSessions > 0
          ? Math.round((record.totalOnTime / attendedSessions) * 100)
          : 0;

      // Calculate performance score using attendance-focused formula
      const performanceScore =
        totalSessions > 0
          ? Math.max(
              0,
              Math.round(
                ((record.totalOnTime * 1.0 +
                  record.totalLate * 0.7 +
                  record.totalAbsent * -0.2) /
                  totalSessions) *
                  100
              )
            )
          : 0;

      // Format member name from the joined member data
      const memberName = record.member
        ? `${record.member.firstName || ""} ${
            record.member.lastName || ""
          }`.trim()
        : `Member ${record.memberId}`;

      return {
        id: record.memberId,
        name: memberName || `Member ${record.memberId}`,
        totalSessions,
        onTime: record.totalOnTime,
        late: record.totalLate,
        absent: record.totalAbsent,
        attendanceRate,
        punctualityRate,
        performanceScore,
      };
    });
  }, [recordAggregates]);

  const columns = useMemo<ColumnDef<MemberStats>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Member" />
        ),
        minSize: 150,
        size: 200,
        maxSize: 300,
      },
      {
        accessorKey: "totalSessions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total Sessions" />
        ),
        minSize: 80,
        size: 120,
      },
      {
        accessorKey: "onTime",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="On Time" />
        ),
        minSize: 80,
        size: 100,
      },
      {
        accessorKey: "late",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Late" />
        ),
        minSize: 80,
        size: 100,
      },
      {
        accessorKey: "absent",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Absent" />
        ),
        minSize: 80,
        size: 100,
      },
      {
        accessorKey: "attendanceRate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Attendance Rate" />
        ),
        cell: ({ row }) => {
          const value = row.getValue("attendanceRate") as number;
          return (
            <div className="flex items-center gap-2">
              <Progress
                value={value}
                className="h-2 w-[60px] bg-emerald-50 [&>div]:bg-emerald-500"
              />
              <span className="text-sm">{value}%</span>
            </div>
          );
        },
        minSize: 140,
        size: 160,
      },
      {
        accessorKey: "punctualityRate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Punctuality Rate" />
        ),
        cell: ({ row }) => {
          const value = row.getValue("punctualityRate") as number;
          return (
            <div className="flex items-center gap-2">
              <Progress
                value={value}
                className="h-2 w-[60px] bg-sky-50 [&>div]:bg-sky-500"
              />
              <span className="text-sm">{value}%</span>
            </div>
          );
        },
        minSize: 140,
        size: 160,
      },
      {
        accessorKey: "performanceScore",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Performance Score" />
        ),
        cell: ({ row }) => {
          const value = row.getValue("performanceScore") as number;
          const colorClass =
            value >= 80
              ? "bg-green-50 [&>div]:bg-green-500"
              : value >= 60
              ? "bg-yellow-50 [&>div]:bg-yellow-500"
              : "bg-red-50 [&>div]:bg-red-500";

          return (
            <div className="flex items-center gap-2">
              <Progress
                value={value}
                className={`h-2 w-[60px] ${colorClass}`}
              />
              <span className="text-sm">{value}%</span>
            </div>
          );
        },
        minSize: 160,
        size: 180,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (recordAggregates.length === 0) {
    return (
      <div className="space-y-4" data-testid={dataTestId}>
        <h3 className="text-lg font-semibold">Member Attendance Records</h3>
        <div className="rounded-md border bg-white p-8">
          <p className="text-sm text-muted-foreground text-center">
            No member attendance data available for this group and season.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid={dataTestId}>
      <h3 className="text-lg font-semibold">Member Attendance Records</h3>
      <DataTable
        table={table}
        columns={columns}
        data={data}
        containerWidth="w-full"
      />
    </div>
  );
}
