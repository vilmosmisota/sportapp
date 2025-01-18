"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, UserMinus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";

export interface TeamPlayer {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  position: string;
  gender: string;
}

interface PlayerTableActionsProps {
  player: TeamPlayer;
  onRemove: (playerId: number) => void;
  canManageTeams: boolean;
}

const PlayerTableActions = ({
  player,
  onRemove,
  canManageTeams,
}: PlayerTableActionsProps) => {
  if (!canManageTeams) return null;

  return (
    <div className="flex items-center justify-end gap-2">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 opacity-0 md:opacity-0 md:group-hover/row:opacity-100 transition-opacity sm:opacity-100 data-[state=open]:bg-gray-100"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() => onRemove(player.id)}
            className="cursor-pointer text-red-500"
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Remove from Team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

interface PlayersTableColumnsProps {
  onRemove: (playerId: number) => void;
  canManageTeams: boolean;
}

export const playerColumns = ({
  onRemove,
  canManageTeams,
}: PlayersTableColumnsProps): ColumnDef<TeamPlayer>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const firstName = row.original.firstName;
      const lastName = row.original.lastName;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {firstName} {lastName}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "dateOfBirth",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date of Birth" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{format(new Date(row.getValue("dateOfBirth")), "PP")}</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "position",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="capitalize">
          {row.getValue("position")}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="capitalize">
          {row.getValue("gender")}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <PlayerTableActions
        player={row.original}
        onRemove={onRemove}
        canManageTeams={canManageTeams}
      />
    ),
  },
];
