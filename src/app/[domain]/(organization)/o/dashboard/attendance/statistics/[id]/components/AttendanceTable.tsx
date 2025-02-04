import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMemo, useState } from "react";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";

interface AttendanceTableProps {
  players: Array<{
    player: {
      id: number;
      firstName: string;
      lastName: string;
    };
  }>;
  playerStats: any[];
  teamId: number;
  seasonId: number;
  tenantId: string;
}

type PlayerStats = {
  id: number;
  name: string;
  totalSessions: number;
  present: number;
  late: number;
  absent: number;
  attendanceRate: number;
  accuracyRate: number;
};

export function AttendanceTable({
  players,
  playerStats,
  teamId,
  seasonId,
  tenantId,
}: AttendanceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const data = useMemo(() => {
    if (!players || !playerStats) return [];

    return players
      .filter((connection) => connection.player)
      .map((connection) => {
        const player = connection.player!;
        const stats = playerStats?.find((s) => s.playerId === player.id);

        if (!stats) return null;

        const totalSessions =
          stats.totalAttendance + stats.totalLate + stats.totalAbsent;

        if (totalSessions === 0) return null;

        const attendanceRate = Math.round(
          ((stats.totalAttendance + stats.totalLate) / totalSessions) * 100
        );
        const accuracyRate = Math.round(
          (stats.totalAttendance / totalSessions) * 100
        );

        return {
          id: player.id,
          name: `${player.firstName} ${player.lastName}`,
          totalSessions,
          present: stats.totalAttendance,
          late: stats.totalLate,
          absent: stats.totalAbsent,
          attendanceRate,
          accuracyRate,
        };
      })
      .filter((item): item is PlayerStats => item !== null);
  }, [players, playerStats]);

  const columns = useMemo<ColumnDef<PlayerStats>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Player" />
        ),
      },
      {
        accessorKey: "totalSessions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total Sessions" />
        ),
      },
      {
        accessorKey: "present",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Present" />
        ),
      },
      {
        accessorKey: "late",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Late" />
        ),
      },
      {
        accessorKey: "absent",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Absent" />
        ),
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
              <span>{value}%</span>
            </div>
          );
        },
      },
      {
        accessorKey: "accuracyRate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Accuracy Rate" />
        ),
        cell: ({ row }) => {
          const value = row.getValue("accuracyRate") as number;
          return (
            <div className="flex items-center gap-2">
              <Progress
                value={value}
                className="h-2 w-[60px] bg-sky-50 [&>div]:bg-sky-500"
              />
              <span>{value}%</span>
            </div>
          );
        },
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Attendance Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
