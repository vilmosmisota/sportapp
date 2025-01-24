"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useUserRoles } from "@/entities/user/hooks/useUserRoles";
import { Permissions } from "@/libs/permissions/permissions";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useSeasons } from "@/entities/season/Season.actions.client";
import { AddSeasonForm } from "./forms/AddSeasonForm";
import { SeasonItem } from "./items/SeasonItem";

export default function SeasonsPage({
  params,
}: {
  params: { domain: string };
}) {
  const { data: tenant } = useTenantByDomain(params.domain);
  const { data: seasons } = useSeasons(tenant?.id?.toString());
  const userEntity = useUserRoles();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const canManageSeasons = Permissions.Seasons.manage(userEntity);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Seasons</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s seasons and their settings
          </p>
        </div>
        {canManageSeasons && (
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Season
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {seasons?.map((season) => (
          <SeasonItem
            key={season.id}
            season={season}
            tenantId={tenant?.id?.toString() ?? ""}
            domain={params.domain}
          />
        ))}
      </div>

      <ResponsiveSheet
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        title="Add Season"
      >
        {tenant && (
          <AddSeasonForm
            tenantId={tenant.id.toString()}
            domain={params.domain}
            setIsParentModalOpen={setIsAddOpen}
          />
        )}
      </ResponsiveSheet>
    </div>
  );
}
