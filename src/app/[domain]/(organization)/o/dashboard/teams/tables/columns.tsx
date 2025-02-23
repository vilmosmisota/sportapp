"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Team } from "@/entities/team/Team.schema";
import { Eye, SquarePen, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getDisplayAgeGroup } from "@/entities/team/Team.schema";
import { PermissionDropdownMenu } from "@/components/auth/PermissionDropdownMenu";
import { Permission } from "@/entities/role/Role.permissions";

interface TeamsTableActionsProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (teamId: number) => void;
  domain: string;
}

const TeamsTableActions = ({
  team,
  onEdit,
  onDelete,
  domain,
}: TeamsTableActionsProps) => {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover/row:opacity-100 transition-opacity"
        asChild
      >
        <Link href={`/o/dashboard/teams/${team.id}`}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">View team</span>
        </Link>
      </Button>

      <PermissionDropdownMenu
        actions={[
          {
            label: "Edit",
            onClick: () => onEdit(team),
            icon: <SquarePen className="h-4 w-4" />,
            permission: Permission.MANAGE_TEAM,
          },
          {
            label: "Delete",
            onClick: () => onDelete(team.id),
            icon: <Trash2 className="h-4 w-4" />,
            permission: Permission.MANAGE_TEAM,
            variant: "destructive",
          },
        ]}
        buttonClassName="opacity-0 group-hover/row:opacity-100 transition-opacity"
      />
    </div>
  );
};

const PlayersCell = ({ team }: { team: Team }) => {
  const players =
    team.playerTeamConnections
      ?.map((c) => c.player)
      .filter(
        (player): player is NonNullable<typeof player> => player !== null
      ) ?? [];

  if (!players.length) {
    return <div className="text-muted-foreground text-sm">No players</div>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{players.length}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {players.map((player) => (
              <div key={player.id} className="whitespace-nowrap">
                {player.firstName} {player.lastName}
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const customAgeSort = (rowA: any, rowB: any) => {
  const ageA = rowA.original.age;
  const ageB = rowB.original.age;

  const numA = parseInt(ageA.replace(/u/i, ""), 10);
  const numB = parseInt(ageB.replace(/u/i, ""), 10);

  return numA - numB;
};

const customCoachFilter = (row: any, columnId: string, filterValue: string) => {
  const coach = row.getValue(columnId);
  if (!coach) return false;
  const fullName = `${coach.firstName} ${coach.lastName}`.toLowerCase();
  return fullName.includes(filterValue.toLowerCase());
};

interface ColumnsProps {
  onEdit: (team: Team) => void;
  onDelete: (teamId: number) => void;

  domain: string;
}

export const columns = ({
  onEdit,
  onDelete,

  domain,
}: ColumnsProps): ColumnDef<Team>[] => [
  {
    accessorKey: "age",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Age Group" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-medium whitespace-nowrap">
          {getDisplayAgeGroup(row.getValue("age"))}
        </Badge>
      </div>
    ),
    sortingFn: customAgeSort,
    minSize: 100,
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize whitespace-nowrap">
        {row.getValue("gender")}
      </Badge>
    ),
    minSize: 90,
  },
  {
    accessorKey: "skill",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Skill Level" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize whitespace-nowrap">
        {row.getValue("skill")}
      </Badge>
    ),
    minSize: 100,
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
    id: "players",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Players" />
    ),
    cell: ({ row }) => <PlayersCell team={row.original} />,
    minSize: 100,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <TeamsTableActions
        team={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
        domain={domain}
      />
    ),
    minSize: 100,
  },
];
