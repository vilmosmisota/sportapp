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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
  );
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
      <Badge variant="outline" className="font-medium">
        {row.getValue("age")}
      </Badge>
    ),
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.getValue("gender")}
      </Badge>
    ),
  },
  {
    accessorKey: "skill",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Skill Level" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.getValue("skill")}
      </Badge>
    ),
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
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-medium lowercase">
              {coach.firstName?.[0]}
              {coach.lastName?.[0]}
            </span>
          </div>
          <span className="font-medium">
            {coach.firstName} {coach.lastName}
          </span>
        </div>
      );
    },
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
  },
];
