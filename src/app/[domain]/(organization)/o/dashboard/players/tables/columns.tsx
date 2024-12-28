"use client";

import { Player } from "@/entities/player/Player.schema";
import { ColumnDef } from "@tanstack/react-table";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import { format, differenceInYears } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Eye, MoreVertical, SquarePen, Trash2, Users } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        <Badge key={team.id} variant="outline" className="whitespace-nowrap">
          {[team.age, team.gender, team.skill]
            .filter(
              (value): value is string =>
                typeof value === "string" && value.length > 0
            )
            .join(" • ")}
        </Badge>
      ))}
    </div>
  );
};

const MembershipCell = ({ player }: { player: Player }) => {
  if (!player.membershipCategory) {
    return <div className="text-muted-foreground text-sm">No membership</div>;
  }

  return (
    <Badge variant="outline" className="whitespace-nowrap">
      {player.membershipCategory.name}
    </Badge>
  );
};

const ParentsCell = ({ player }: { player: Player }) => {
  const [isOpen, setIsOpen] = useState(false);
  const parents =
    player.userConnections?.filter((c) => c.isParent && c.user) || [];

  if (!parents.length) {
    return <div className="text-muted-foreground text-sm">No parents</div>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{parents.length}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {parents.map((connection) => {
              const parent = connection.user!;
              return (
                <Dialog
                  key={connection.id}
                  open={isOpen}
                  onOpenChange={setIsOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="link" className="h-auto p-0">
                      {parent.firstName} {parent.lastName}
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onInteractOutside={(e) => e.preventDefault()}
                  >
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
            })}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
    minSize: 200,
  },
  {
    accessorKey: "dateOfBirth",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date of Birth" />
    ),
    cell: ({ row }) => {
      const date = row.original.dateOfBirth;
      if (!date) return null;

      const birthDate = new Date(date);
      const age = differenceInYears(new Date(), birthDate);

      return (
        <div className="flex items-start flex-col gap-2">
          <div className="text-sm">{format(birthDate, "dd/MM/yyyy")}</div>

          <Badge variant="outline" className="text-xs">
            {age} years
          </Badge>
        </div>
      );
    },
    minSize: 180,
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
    minSize: 90,
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
    minSize: 100,
  },
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
    minSize: 200,
  },
  {
    id: "membership",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Membership" />
    ),
    cell: ({ row }) => <MembershipCell player={row.original} />,
    accessorFn: (row) => row.membershipCategory?.name,
    enableSorting: true,
    minSize: 120,
  },
  {
    id: "parents",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Parents" />
    ),
    cell: ({ row }) => <ParentsCell player={row.original} />,
    accessorFn: (row) => {
      const parents =
        row.userConnections?.filter((c) => c.isParent && c.user) || [];
      return parents
        .map((c) => `${c.user!.firstName} ${c.user!.lastName}`)
        .join(", ");
    },
    enableSorting: true,
    minSize: 100,
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
    minSize: 100,
  },
];
