"use client";

import { usePlayers } from "@/entities/player/Player.actions.client";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useUserRoles } from "@/entities/user/hooks/useUserRoles";
import { Permissions } from "@/libs/permissions/permissions";
import { PageHeader } from "@/components/ui/page-header";
import AddPlayerForm from "./forms/AddPlayerForm";
import PlayersTable from "./tables/PlayersTable";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function PlayersPage({
  params,
}: {
  params: { domain: string };
}) {
  const { data: tenant, isLoading: isTenantLoading } = useTenantByDomain(
    params.domain
  );
  const {
    data: players,
    error,
    isLoading: isPlayersLoading,
  } = usePlayers(tenant?.id ? tenant.id.toString() : undefined);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const userEntity = useUserRoles();
  const canManagePlayers = Permissions.Players.manage(userEntity);

  const isLoading = isTenantLoading || isPlayersLoading;

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center space-y-2">
        <h3 className="text-lg font-medium">Organization not found</h3>
        <p className="text-sm text-muted-foreground">
          The organization you&apos;re looking for does not exist.
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-full space-y-6">
        <PageHeader
          title="Players"
          description="Manage your organization's players and their teams."
          actions={
            canManagePlayers && (
              <Button
                onClick={() => setIsAddPlayerOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Player
              </Button>
            )
          }
        />

        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error.message}
          </div>
        )}

        {players && (
          <PlayersTable
            players={players}
            tenantId={tenant.id.toString()}
            domain={params.domain}
            canManagePlayers={canManagePlayers}
          />
        )}

        <ResponsiveSheet
          isOpen={isAddPlayerOpen}
          setIsOpen={setIsAddPlayerOpen}
          title="Add Player"
        >
          <AddPlayerForm
            tenantId={tenant.id.toString()}
            domain={params.domain}
            setIsParentModalOpen={setIsAddPlayerOpen}
          />
        </ResponsiveSheet>
      </div>
    </ErrorBoundary>
  );
}
