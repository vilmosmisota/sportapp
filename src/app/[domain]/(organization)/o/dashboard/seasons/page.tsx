"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useSeasons } from "@/entities/season/Season.actions.client";
import { PageHeader } from "@/components/ui/page-header";
import { AddSeasonForm } from "./forms/AddSeasonForm";
import { SeasonItem } from "./items/SeasonItem";
import { PermissionButton } from "@/components/auth/PermissionButton";
import { Permission } from "@/entities/role/Role.permissions";
import { useTenantAndUserAccessContext } from "@/components/auth/TenantAndUserAccessContext";

export default function SeasonsPage() {
  const { tenant } = useTenantAndUserAccessContext();
  const { data: seasons } = useSeasons(tenant?.id?.toString());

  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seasons"
        description="Manage your organization's seasons and their settings"
        actions={
          <PermissionButton
            onClick={() => setIsAddOpen(true)}
            permission={Permission.MANAGE_SEASONS}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Season
          </PermissionButton>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {seasons?.map((season) => (
          <SeasonItem
            key={season.id}
            season={season}
            tenantId={tenant?.id?.toString() ?? ""}
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
            setIsParentModalOpen={setIsAddOpen}
          />
        )}
      </ResponsiveSheet>
    </div>
  );
}
