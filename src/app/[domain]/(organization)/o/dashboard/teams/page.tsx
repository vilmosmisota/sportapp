"use client";

import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { PageHeader } from "@/components/ui/page-header";
import TeamsTable from "./tables/TeamsTable";
import AddTeamForm from "./forms/AddTeamForm";
import { PermissionButton } from "@/components/auth/PermissionButton";
import { Permission } from "@/entities/role/Role.permissions";

export default function TeamsPage({ params }: { params: { domain: string } }) {
  const { data: tenant } = useTenantByDomain(params.domain);
  const { data: teams, error } = useGetTeamsByTenantId(
    tenant?.id.toString() ?? ""
  );
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Teams"
        description="Manage your organization's teams and their settings"
        actions={
          <PermissionButton
            onClick={() => setIsAddTeamOpen(true)}
            className="gap-2"
            permission={Permission.MANAGE_TEAM}
          >
            <Plus className="h-4 w-4" />
            Add Team
          </PermissionButton>
        }
      />

      {error && <div className="text-red-500">{error.message}</div>}

      {teams && (
        <TeamsTable
          teams={teams}
          tenantId={tenant?.id.toString() ?? ""}
          domain={params.domain}
        />
      )}

      <ResponsiveSheet
        isOpen={isAddTeamOpen}
        setIsOpen={setIsAddTeamOpen}
        title="Add Team"
      >
        <AddTeamForm
          tenantId={tenant?.id.toString() ?? ""}
          domain={params.domain}
          setIsParentModalOpen={setIsAddTeamOpen}
        />
      </ResponsiveSheet>
    </div>
  );
}
