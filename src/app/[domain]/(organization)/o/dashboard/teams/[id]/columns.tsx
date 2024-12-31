"use client";

import { ColumnDef } from "@tanstack/react-table";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import { Badge } from "@/components/ui/badge";
import { differenceInYears, parseISO } from "date-fns";

export type TeamPlayer = {
  id: number;
  firstName: string;
  secondName: string;
  dateOfBirth: string | null;
  position: string | null;
  gender: string | null;
};

export const playerColumns: ColumnDef<TeamPlayer>[] = [
  {
    id: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    accessorFn: (row) => `${row.firstName} ${row.secondName}`,
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.firstName} {row.original.secondName}
      </div>
    ),
  },
  {
    id: "age",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Age" />
    ),
    accessorFn: (row) =>
      row.dateOfBirth
        ? differenceInYears(new Date(), parseISO(row.dateOfBirth))
        : null,
    cell: ({ row }) => {
      const age = row.original.dateOfBirth
        ? differenceInYears(new Date(), parseISO(row.original.dateOfBirth))
        : null;
      return age ? (
        <div className="font-medium">{age}</div>
      ) : (
        <div className="text-muted-foreground text-sm">-</div>
      );
    },
  },
  {
    accessorKey: "position",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
    cell: ({ row }) => {
      const position = row.original.position;
      return position ? (
        <Badge variant="outline" className="capitalize">
          {position.toLowerCase()}
        </Badge>
      ) : (
        <div className="text-muted-foreground text-sm">-</div>
      );
    },
  },
];
