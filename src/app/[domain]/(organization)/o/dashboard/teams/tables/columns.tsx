"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Team } from "@/entities/team/Team.schema";
import { MoreVertical, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import { cn } from "@/libs/tailwind/utils";

interface TeamsTableActionsProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (teamId: number) => void;
  canManageTeams: boolean;
}

const TeamsTableActions = ({
  team,
  onEdit,
  onDelete,
  canManageTeams,
}: TeamsTableActionsProps) => {
  if (!canManageTeams) return null;

  return (
    <div className="flex items-center justify-end gap-2">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 data-[state=open]:bg-gray-100"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() => onEdit(team)}
            className="cursor-pointer"
          >
            <SquarePen className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(team.id)}
            className="cursor-pointer text-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const customAgeSort = (rowA: any, rowB: any) => {
  const ageA = rowA.original.age;
  const ageB = rowB.original.age;

  const numA = parseInt(ageA.replace(/u/i, ""), 10);
  const numB = parseInt(ageB.replace(/u/i, ""), 10);

  return numA - numB; // Sort numerically
};

const customCoachFilter = (row: any, columnId: string, filterValue: string) => {
  const coach = row.getValue(columnId);
  if (!coach) return false; // No coach, can't match
  const fullName = `${coach.firstName} ${coach.lastName}`.toLowerCase();
  return fullName.includes(filterValue.toLowerCase());
};

export const columns = ({
  onEdit,
  onDelete,
  canManageTeams,
}: {
  onEdit: (team: Team) => void;
  onDelete: (teamId: number) => void;
  canManageTeams: boolean;
}): ColumnDef<Team>[] => [
  {
    accessorKey: "age",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Age Group" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <Badge
          variant="outline"
          className="font-medium whitespace-nowrap w-fit"
        >
          {row.getValue("age")}
        </Badge>
        <div className="flex gap-1 md:hidden">
          <Badge variant="secondary" className="capitalize text-xs">
            {row.getValue("gender")}
          </Badge>
          <Badge variant="secondary" className="capitalize text-xs">
            {row.getValue("skill")}
          </Badge>
        </div>
      </div>
    ),
    sortingFn: customAgeSort,
    minSize: 120,
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => (
      <div className="hidden md:block">
        <Badge variant="secondary" className="capitalize whitespace-nowrap">
          {row.getValue("gender")}
        </Badge>
      </div>
    ),
    minSize: 100,
  },
  {
    accessorKey: "skill",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Skill Level" />
    ),
    cell: ({ row }) => (
      <div className="hidden md:block">
        <Badge variant="secondary" className="capitalize whitespace-nowrap">
          {row.getValue("skill")}
        </Badge>
      </div>
    ),
    minSize: 120,
  },
  {
    accessorKey: "coach",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Coach" />
    ),
    cell: ({ row }) => {
      const coach = row.original.coach;
      if (!coach) return "-";
      return (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium lowercase">
              {coach.firstName?.[0]}
              {coach.lastName?.[0]}
            </span>
          </div>
          <span className="font-medium capitalize truncate">
            {coach.firstName} {coach.lastName}
          </span>
        </div>
      );
    },
    enableColumnFilter: true,
    filterFn: customCoachFilter,
    minSize: 200,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <TeamsTableActions
          team={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
          canManageTeams={canManageTeams}
        />
      </div>
    ),
    minSize: 70,
  },
];
