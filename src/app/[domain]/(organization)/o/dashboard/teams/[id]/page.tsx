"use client";

import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { useUserRoles } from "@/entities/user/hooks/useUserRoles";
import { Permissions } from "@/libs/permissions/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayGender } from "@/entities/team/Team.schema";
import { Separator } from "@/components/ui/separator";
import { playerColumns, TeamPlayer } from "./columns";
import { DataTable } from "@/components/ui/data-table/DataTable";
import {
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { PageHeader } from "@/components/ui/page-header";

import { useState, useMemo, useCallback } from "react";
import TeamTrainings from "./components/TeamTrainings";
import { toast } from "sonner";
import { useRemovePlayerFromTeam } from "@/entities/player/PlayerTeam.actions.client";
import ManagePlayersForm from "./forms/ManagePlayersForm";

export default function TeamPage({
  params,
}: {
  params: { domain: string; id: string };
}) {
  const { data: tenant, isLoading: isTenantLoading } = useTenantByDomain(
    params.domain
  );
  const { data: teams, isLoading: isTeamsLoading } = useGetTeamsByTenantId(
    tenant?.id.toString() ?? ""
  );
  const userEntity = useUserRoles();
  const canManageTeams = Permissions.Teams.manage(userEntity);
  const [isManagePlayersOpen, setIsManagePlayersOpen] = useState(false);

  const isLoading = isTenantLoading || isTeamsLoading || !teams;
  const team = teams?.find((t) => t.id === parseInt(params.id));

  // Memoize players array to prevent unnecessary re-renders
  const players: TeamPlayer[] = useMemo(
    () =>
      team?.playerTeamConnections
        ?.map((connection) => {
          if (!connection.player) return null;
          return {
            id: connection.player.id,
            firstName: connection.player.firstName ?? "",
            lastName: connection.player.lastName ?? "",
            dateOfBirth: connection.player.dateOfBirth,
            position: connection.player.position,
            gender: connection.player.gender,
          };
        })
        .filter((player): player is TeamPlayer => player !== null) ?? [],
    [team?.playerTeamConnections]
  );

  const removePlayerFromTeam = useRemovePlayerFromTeam(
    tenant?.id.toString() ?? ""
  );

  const handleRemovePlayer = useCallback(
    (playerId: number) => {
      if (!team) return;

      removePlayerFromTeam.mutate(
        { teamId: team.id, playerId },
        {
          onSuccess: () => {
            toast.success("Player removed from team");
          },
          onError: (error: Error) => {
            toast.error(error.message);
          },
        }
      );
    },
    [team, removePlayerFromTeam]
  );

  const table = useReactTable({
    data: players,
    columns: playerColumns({
      onRemove: handleRemovePlayer,
      canManageTeams: canManageTeams,
    }),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center space-y-2">
        <h3 className="text-lg font-medium">Team not found</h3>
        <p className="text-sm text-muted-foreground">
          The team you&apos;re looking for does not exist.
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-full space-y-6">
        <PageHeader
          title={
            team.name ||
            `${getDisplayGender(team.gender, team.age)} ${team.age}`
          }
          description="Team details and player management"
          backButton={{
            href: `/o/dashboard/teams`,
            label: "Back to Teams",
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Info Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium">
                  Team Information
                </CardTitle>
                {canManageTeams && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 data-[state=open]:bg-muted"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Team
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Category
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{team.age}</Badge>
                    <Badge variant="secondary" className="capitalize">
                      {team.gender?.toLowerCase()}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Skill Level
                  </h4>
                  <Badge variant="secondary" className="capitalize">
                    {team.skill}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Coach
                  </h4>
                  {team.coach ? (
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {team.coach.firstName} {team.coach.lastName}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No coach assigned
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">
                      {players.length} Player{players.length !== 1 ? "s" : ""}{" "}
                      Assigned
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <TeamTrainings
              tenantId={tenant?.id.toString() ?? ""}
              teamId={team.id}
            />
          </div>

          {/* Players Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium">
                  Team Players
                </CardTitle>
                {canManageTeams && (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => setIsManagePlayersOpen(true)}
                  >
                    <Users className="h-4 w-4" />
                    Assign Players
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-[calc(100vw-3rem)] md:w-full">
                  {players.length > 0 ? (
                    <DataTable
                      table={table}
                      columns={playerColumns({
                        onRemove: handleRemovePlayer,
                        canManageTeams: canManageTeams,
                      })}
                      data={players}
                      rowClassName="group/row"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No players assigned to this team
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {team && tenant && (
        <ResponsiveSheet
          isOpen={isManagePlayersOpen}
          setIsOpen={setIsManagePlayersOpen}
          title="Assign Players"
          description="Add or remove players from this team"
        >
          <ManagePlayersForm
            team={team}
            tenantId={tenant.id.toString()}
            setIsOpen={setIsManagePlayersOpen}
          />
        </ResponsiveSheet>
      )}
    </ErrorBoundary>
  );
}
