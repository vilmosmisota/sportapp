"use client";

import { usePlayers } from "@/entities/player/Player.actions.client";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";

import { useUserRoles } from "@/entities/user/hooks/useUserRoles";
import { Permissions } from "@/libs/permissions/permissions";
import AddPlayerForm from "./forms/AddPlayerForm";
import PlayersTable from "./tables/PlayersTable";

export default function PlayersPage({
  params,
}: {
  params: { domain: string };
}) {
  const { data: tenant } = useTenantByDomain(params.domain);
  const { data: players, error } = usePlayers(tenant?.id.toString() ?? "");
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const userEntity = useUserRoles();
  const canManagePlayers = Permissions.Players.manage(userEntity);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold tracking-tight">Players</h3>
        {canManagePlayers && (
          <Button onClick={() => setIsAddPlayerOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Player
          </Button>
        )}
      </div>

      {error && <div className="text-red-500">{error.message}</div>}

      {players && (
        <PlayersTable
          players={players}
          tenantId={tenant?.id.toString() ?? ""}
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
          tenantId={tenant?.id.toString() ?? ""}
          domain={params.domain}
          setIsParentModalOpen={setIsAddPlayerOpen}
        />
      </ResponsiveSheet>
    </div>
  );
}
