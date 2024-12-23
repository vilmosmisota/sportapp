"use client";

import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import TeamsTable from "./tables/TeamsTable";
import AddTeamForm from "./forms/AddTeamForm";
import { useUserRoles } from "@/entities/user/hooks/useUserRoles";
import { Permissions } from "@/libs/permissions/permissions";

export default function TeamsPage({ params }: { params: { domain: string } }) {
  const { data: tenant } = useTenantByDomain(params.domain);
  const { data: teams, error } = useGetTeamsByTenantId(
    tenant?.id.toString() ?? ""
  );
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const userEntity = useUserRoles();
  const canManageTeams = Permissions.Teams.manage(userEntity);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold tracking-tight">Teams</h3>
        {canManageTeams && (
          <Button
            onClick={() => setIsAddTeamOpen(true)}
            className="gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add Team
          </Button>
        )}
      </div>

      <TeamsTable
        teams={teams}
        tenantId={tenant?.id.toString() ?? ""}
        canManageTeams={canManageTeams}
      />

      <ResponsiveSheet
        isOpen={isAddTeamOpen}
        setIsOpen={setIsAddTeamOpen}
        title="Add Team"
      >
        <AddTeamForm
          tenantId={tenant?.id.toString() ?? ""}
          setIsParentModalOpen={setIsAddTeamOpen}
        />
      </ResponsiveSheet>
    </div>
  );
}
