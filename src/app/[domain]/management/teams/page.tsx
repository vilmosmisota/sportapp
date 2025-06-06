"use client";

import { PageHeader } from "@/components/ui/page-header";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { PermissionButton } from "@/composites/auth/PermissionButton";
import { useGetTeamsByTenantId } from "@/entities/group/Group.query";
import { Permission } from "@/entities/role/Role.permissions";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTenantAndUserAccessContext } from "../../../../../../composites/auth/TenantAndUserAccessContext";
import AddTeamForm from "./forms/AddTeamForm";
import TeamsTable from "./tables/TeamsTable";

export default function TeamsPage({ params }: { params: { domain: string } }) {
  const { tenant } = useTenantAndUserAccessContext();
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
