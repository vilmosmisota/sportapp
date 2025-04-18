"use client";

import { Player } from "@/entities/player/Player.schema";
import { ColumnDef } from "@tanstack/react-table";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import { format, differenceInYears } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Eye, MoreVertical, SquarePen, Trash2, Users } from "lucide-react";

import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { MarsIcon, VenusIcon } from "@/components/icons/icons";
import { PermissionDropdownMenu } from "@/components/auth/PermissionDropdownMenu";
import { Permission } from "@/entities/role/Role.permissions";
import { TeamBadge } from "@/components/ui/team-badge";

const TeamsCell = ({ player }: { player: Player }) => {
  if (!player.teamConnections?.length) {
    return <div className="text-muted-foreground text-sm">No teams</div>;
  }

  const teams = player.teamConnections
    .map((c) => c.team)
    .filter((team): team is NonNullable<typeof team> => team !== null);

  if (!teams.length) {
    return <div className="text-muted-foreground text-sm">No active teams</div>;
  }

  return (
    <div className="flex flex-wrap gap-2 flex-col items-start justify-start">
      {teams.map((team) => (
        <TeamBadge key={team.id} team={team} size="sm" />
      ))}
    </div>
  );
};

const ParentsCell = ({
  player,
  onShowConnectedUsers,
}: {
  player: Player;
  onShowConnectedUsers: (player: Player) => void;
}) => {
  const parents = player.userConnections || [];

  if (!parents.length) {
    return (
      <div className="text-muted-foreground text-sm">No connected users</div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="p-0 h-auto hover:bg-transparent"
      onClick={() => onShowConnectedUsers(player)}
    >
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{parents.length}</span>
      </div>
    </Button>
  );
};

interface PlayersTableColumnsProps {
  onEdit: (player: Player) => void;
  onDelete: (playerId: number) => void;
  onShowConnectedUsers: (player: Player) => void;
  domain: string;
  showPositionColumn?: boolean;
}

interface PlayersTableActionsProps {
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (playerId: number) => void;
  domain: string;
}

const PlayersTableActions = ({
  player,
  onEdit,
  onDelete,
  domain,
}: PlayersTableActionsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Temporarily hidden until player details page is ready */}
      {/* <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover/row:opacity-100 transition-opacity"
        asChild
      >
        <Link href={`/${domain}/o/dashboard/players/${player.id}`}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">View player</span>
        </Link>
      </Button> */}

      <PermissionDropdownMenu
        actions={[
          {
            label: "Edit",
            onClick: () => onEdit(player),
            icon: <SquarePen className="h-4 w-4" />,
            permission: Permission.MANAGE_PLAYERS,
          },
          {
            label: "Delete",
            onClick: () => setIsDeleteDialogOpen(true),
            icon: <Trash2 className="h-4 w-4" />,
            permission: Permission.MANAGE_PLAYERS,
            variant: "destructive",
          },
        ]}
        buttonClassName="opacity-0 group-hover/row:opacity-100 transition-opacity"
      />

      <ConfirmDeleteDialog
        categoryId={player.id}
        text={`Are you sure you want to delete ${player.firstName} ${player.lastName}? This action cannot be undone.`}
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={(id) => onDelete(Number(id))}
      />
    </div>
  );
};

export const columns = ({
  onEdit,
  onDelete,
  onShowConnectedUsers,
  domain,
  showPositionColumn,
}: PlayersTableColumnsProps): ColumnDef<Player>[] => [
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
          <span className="max-w-[200px] truncate font-medium">
            {firstName} {lastName}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
    minSize: 150,
    size: 200,
    maxSize: 300,
    filterFn: (row, id, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const firstName = (row.original.firstName || "").toLowerCase();
      const lastName = (row.original.lastName || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`.toLowerCase();

      return (
        fullName.includes(searchValue) ||
        firstName.includes(searchValue) ||
        lastName.includes(searchValue)
      );
    },
  },
  {
    accessorKey: "pin",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PIN" />
    ),
    cell: ({ row }) => {
      const pin = row.original.pin;
      return (
        <div className="flex space-x-2">
          <span className="font-medium">{pin || "-"}</span>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    minSize: 80,
    size: 100,
    maxSize: 120,
    enableColumnFilter: false,
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
        <div className="text-sm">{format(new Date(date), "dd/MM/yyyy")}</div>
      );
    },
    minSize: 120,
    size: 150,
    maxSize: 180,
  },
  {
    id: "age",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Age" />
    ),
    cell: ({ row }) => {
      const date = row.original.dateOfBirth;
      if (!date) return null;
      const age = differenceInYears(new Date(), new Date(date));
      return <div className="text-sm">{age}</div>;
    },
    accessorFn: (row) => {
      if (!row.dateOfBirth) return 0;
      return differenceInYears(new Date(), new Date(row.dateOfBirth));
    },
    minSize: 80,
    size: 100,
    maxSize: 120,
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => {
      const gender = row.original.gender;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-muted-foreground">
                {gender === "Male" ? (
                  <MarsIcon className="h-4 w-4" />
                ) : (
                  <VenusIcon className="h-4 w-4" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{gender}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    minSize: 80,
    size: 90,
    maxSize: 100,
  },
  ...(showPositionColumn
    ? [
        {
          accessorKey: "position",
          // @ts-ignore - Same pattern as other column headers
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Position" />
          ),
          // @ts-ignore - Same pattern as other column cells
          cell: ({ row }) => {
            return (
              <div className="flex w-[100px]">
                <Badge variant="secondary">{row.original.position}</Badge>
              </div>
            );
          },
          // @ts-ignore - Same pattern as other column filter functions
          filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
          },
          minSize: 80,
          size: 100,
          maxSize: 120,
        },
      ]
    : []),
  {
    id: "teams",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teams" />
    ),
    cell: ({ row }) => <TeamsCell player={row.original} />,
    accessorFn: (row) => {
      const connections = row.teamConnections || [];
      return connections.map((c) => c.teamId.toString());
    },
    filterFn: (row, id, value: string[]) => {
      if (!value?.length) return true;
      const teams = row.getValue(id) as string[];
      return value.some((teamId) => teams.includes(teamId));
    },
    enableSorting: false,
    minSize: 150,
    size: 200,
    maxSize: 300,
  },
  {
    id: "parents",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Connected Users" />
    ),
    cell: ({ row }) => (
      <ParentsCell
        player={row.original}
        onShowConnectedUsers={onShowConnectedUsers}
      />
    ),
    accessorFn: (row) => {
      const connections = row.userConnections || [];
      return connections.map((c) => c.userId).join(", ");
    },
    enableSorting: true,
    minSize: 80,
    size: 100,
    maxSize: 120,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <PlayersTableActions
        player={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
        domain={domain}
      />
    ),
    minSize: 80,
    size: 100,
    maxSize: 120,
  },
];
