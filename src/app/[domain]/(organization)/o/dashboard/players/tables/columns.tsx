"use client";

import { Player } from "@/entities/player/Player.schema";
import { ColumnDef } from "@tanstack/react-table";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import { DataTableRowActions } from "./DataTableRowActions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { usePlayerTeamConnections } from "@/entities/player/PlayerTeam.actions.client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, MoreVertical, SquarePen, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { useGetTeamsByTenantId } from "@/entities/team/Team.query";

// Add type for team connection
interface PlayerTeamConnection {
  id: number;
  teamId: number;
  team: {
    id: number;
    age: string | null;
    gender: string | null;
    skill: string | null;
  } | null;
}

// Add type for extended Player with connections
interface PlayerWithConnections extends Player {
  playerTeamConnections?: PlayerTeamConnection[];
}

const TeamsCell = ({
  playerId,
  tenantId,
}: {
  playerId: number;
  tenantId: string;
}) => {
  const { data: connections, isLoading: connectionsLoading } =
    usePlayerTeamConnections(tenantId, {
      playerId,
    });
  const { data: teams, isLoading: teamsLoading } =
    useGetTeamsByTenantId(tenantId);

  if (connectionsLoading || teamsLoading) {
    return <div className="text-muted-foreground text-sm">Loading...</div>;
  }

  if (!connections?.length) {
    return <div className="text-muted-foreground text-sm">No teams</div>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {connections.map((connection) => {
        const team = teams?.find((t) => t.id === connection.teamId);
        if (!team) return null;
        return (
          <Badge key={connection.id} variant="outline">
            {`${team.age} ${team.gender} ${team.skill}`}
          </Badge>
        );
      })}
    </div>
  );
};

interface PlayersTableColumnsProps {
  onEdit: (player: Player) => void;
  onDelete: (playerId: number) => void;
  canManagePlayers: boolean;
  domain: string;
  tenantId: string;
}

interface PlayersTableActionsProps {
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (playerId: number) => void;
  canManagePlayers: boolean;
  domain: string;
}

const PlayersTableActions = ({
  player,
  onEdit,
  onDelete,
  canManagePlayers,
  domain,
}: PlayersTableActionsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-40 hover:opacity-100"
        asChild
      >
        <Link href={`/${domain}/o/dashboard/players/${player.id}`}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">View player</span>
        </Link>
      </Button>
      {canManagePlayers && (
        <>
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
                onClick={() => onEdit(player)}
                className="cursor-pointer"
              >
                <SquarePen className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="cursor-pointer text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ConfirmDeleteDialog
            categoryId={player.id}
            text={`Are you sure you want to delete ${player.firstName} ${player.secondName}? This action cannot be undone.`}
            isOpen={isDeleteDialogOpen}
            setIsOpen={setIsDeleteDialogOpen}
            onConfirm={(id) => onDelete(Number(id))}
          />
        </>
      )}
    </div>
  );
};

export const columns = ({
  onEdit,
  onDelete,
  canManagePlayers,
  domain,
  tenantId,
}: PlayersTableColumnsProps): ColumnDef<Player>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const firstName = row.original.firstName;
      const secondName = row.original.secondName;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {firstName} {secondName}
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
      const date = row.original.dateOfBirth;
      if (!date) return null;
      return (
        <div className="flex w-[100px]">
          {format(new Date(date), "dd/MM/yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[80px]">
          <Badge variant="outline">{row.original.gender}</Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "position",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px]">
          <Badge variant="outline">{row.original.position}</Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "teams",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teams" />
    ),
    cell: ({ row }) => (
      <TeamsCell playerId={row.original.id} tenantId={tenantId} />
    ),
    accessorFn: (row: PlayerWithConnections) => {
      const connections = row.playerTeamConnections || [];
      return connections.map((c) => c.teamId);
    },
    filterFn: (row, id, value: string[]) => {
      if (!value?.length) return true;
      const teams = row.getValue(id) as number[];
      return value.some((teamId) => teams.includes(Number(teamId)));
    },
    enableSorting: false,
  },
  {
    id: "membership",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Membership" />
    ),
    cell: ({ row }) => {
      const membership = row.original.membership;
      if (!membership) {
        return (
          <div className="text-muted-foreground text-sm">No membership</div>
        );
      }
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="outline">
            {membership.season?.name || `Season ${membership.seasonId}`}
          </Badge>
          <Badge variant="outline">
            {membership.membershipCategory?.name ||
              `Category ${membership.memberhsipCategoryId}`}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "parent",
    header: "Parent/Guardian",
    cell: ({ row }) => {
      const parent = row.original.parent;
      if (!parent) return null;

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="link" className="p-0">
              {parent.firstName} {parent.lastName}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Parent/Guardian Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Name
                </div>
                <div>
                  {parent.firstName} {parent.lastName}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Email
                </div>
                <div>{parent.email}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <PlayersTableActions
        player={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
        canManagePlayers={canManagePlayers}
        domain={domain}
      />
    ),
  },
];
