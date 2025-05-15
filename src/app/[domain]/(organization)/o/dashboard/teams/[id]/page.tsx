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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDisplayGender,
  getDisplayAgeGroup,
} from "@/entities/team/Team.schema";
import { Separator } from "@/components/ui/separator";
import { playerColumns, TeamPlayer } from "./columns";
import { DataTable } from "@/components/ui/data-table/DataTable";
import {
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  VisibilityState,
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

import { useState, useMemo, useCallback, useEffect } from "react";
import TeamTrainings from "./components/TeamTrainings";
import { toast } from "sonner";
import { useRemovePlayerFromTeam } from "@/entities/player/PlayerTeam.actions.client";
import ManagePlayersForm from "./forms/ManagePlayersForm";
import { Permission } from "@/entities/role/Role.permissions";
import { PermissionButton } from "@/components/auth/PermissionButton";
import { PermissionDropdownMenu } from "@/components/auth/PermissionDropdownMenu";
import EditTeamForm from "../forms/EditTeamForm";
import { useRouter } from "next/navigation";
import { useDeleteTeam } from "@/entities/team/Team.actions.client";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { useTenantAndUserAccessContext } from "../../../../../../../components/auth/TenantAndUserAccessContext";

export default function TeamPage({
  params,
}: {
  params: { domain: string; id: string };
}) {
  const router = useRouter();
  const { tenant } = useTenantAndUserAccessContext();
  const { data: teams, isLoading: isTeamsLoading } = useGetTeamsByTenantId(
    tenant?.id.toString() ?? ""
  );

  const [isManagePlayersOpen, setIsManagePlayersOpen] = useState(false);
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isLoading = isTeamsLoading || !teams;
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
      canManageTeams: true,
      teamGender: team?.gender ?? "",
    }),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const deleteTeam = useDeleteTeam(tenant?.id.toString() ?? "");

  const handleDeleteTeam = useCallback(
    async (teamId: number) => {
      try {
        await deleteTeam.mutateAsync(teamId);
        toast.success("Team deleted successfully");
        router.push(`/${params.domain}/o/dashboard/teams`);
      } catch (error) {
        toast.error("Failed to delete team");
      }
    },
    [deleteTeam, router, params.domain]
  );

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
            `${getDisplayGender(team.gender, team.age)} ${getDisplayAgeGroup(
              team.age
            )}`
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

                <PermissionDropdownMenu
                  actions={[
                    {
                      label: "Edit",
                      onClick: () => setIsEditTeamOpen(true),
                      icon: <Edit className="h-4 w-4" />,
                      permission: Permission.MANAGE_TEAM,
                    },
                    {
                      label: "Delete",
                      onClick: () => setIsDeleteDialogOpen(true),
                      icon: <Trash2 className="h-4 w-4" />,
                      permission: Permission.MANAGE_TEAM,
                      variant: "destructive",
                    },
                  ]}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Category
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getDisplayAgeGroup(team.age)}
                    </Badge>
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

                <PermissionButton
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsManagePlayersOpen(true)}
                  permission={Permission.MANAGE_TEAM}
                >
                  <Users className="h-4 w-4" />
                  Assign Players
                </PermissionButton>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-[calc(100vw-3rem)] md:w-full">
                  {players.length > 0 ? (
                    <DataTable
                      table={table}
                      columns={playerColumns({
                        onRemove: handleRemovePlayer,
                        canManageTeams: true,
                        teamGender: team?.gender ?? "",
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
        <>
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

          <ResponsiveSheet
            isOpen={isEditTeamOpen}
            setIsOpen={setIsEditTeamOpen}
            title="Edit Team"
          >
            <EditTeamForm
              team={team}
              tenantId={tenant.id.toString()}
              domain={params.domain}
              setIsParentModalOpen={setIsEditTeamOpen}
            />
          </ResponsiveSheet>

          <ConfirmDeleteDialog
            categoryId={team.id}
            text={`Are you sure you want to delete ${getDisplayGender(
              team.gender,
              team.age
            )} ${getDisplayAgeGroup(team.age)}? This action cannot be undone.`}
            isOpen={isDeleteDialogOpen}
            setIsOpen={setIsDeleteDialogOpen}
            onConfirm={(id) => handleDeleteTeam(Number(id))}
          />
        </>
      )}
    </ErrorBoundary>
  );
}
