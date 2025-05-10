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
import { Permission } from "@/entities/role/Role.permissions";
import { PermissionDropdownMenu } from "@/components/auth/PermissionDropdownMenu";

export interface TeamPlayer {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  position: string | null;
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
      <PermissionDropdownMenu
        actions={[
          {
            label: "Remove from Team",
            onClick: () => onRemove(player.id),
            icon: <UserMinus className="h-4 w-4" />,
            permission: Permission.MANAGE_TEAM,
            variant: "destructive",
          },
        ]}
        buttonClassName="opacity-0 md:opacity-0 md:group-hover/row:opacity-100 transition-opacity sm:opacity-100"
      />
    </div>
  );
};

interface PlayersTableColumnsProps {
  onRemove: (playerId: number) => void;
  canManageTeams: boolean;
  teamGender: string;
  showPositionColumn?: boolean;
}

export const playerColumns = ({
  onRemove,
  canManageTeams,
  teamGender,
  showPositionColumn = true,
}: PlayersTableColumnsProps): ColumnDef<TeamPlayer>[] => {
  const columns: ColumnDef<TeamPlayer>[] = [
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
  ];

  // Only add position column if showPositionColumn is true
  if (showPositionColumn) {
    columns.push({
      accessorKey: "position",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Position" />
      ),
      cell: ({ row }) => {
        const position = row.getValue("position");
        return (
          <Badge variant="secondary" className="capitalize">
            {position ? String(position).toLowerCase() : "-"}
          </Badge>
        );
      },
      enableSorting: true,
    });
  }

  // Only add the gender column if the team is mixed
  if (teamGender.toLowerCase() === "mixed") {
    columns.push({
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
    });
  }

  // Add actions column
  columns.push({
    id: "actions",
    cell: ({ row }) => (
      <PlayerTableActions
        player={row.original}
        onRemove={onRemove}
        canManageTeams={canManageTeams}
      />
    ),
  });

  return columns;
};
