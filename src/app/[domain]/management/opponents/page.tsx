"use client";

import { PageHeader } from "@/components/ui/page-header";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { PermissionButton } from "@/composites/auth/PermissionButton";
import { useOpponents } from "@/entities/opponent/Opponent.query";
import { Permission } from "@/entities/role/Role.permissions";
import { Plus } from "lucide-react";
import { useState } from "react";

import { useTenantAndUserAccessContext } from "../../../../../../composites/auth/TenantAndUserAccessContext";
import OpponentsDataTable from "./components/OpponentsDataTable";
import { CreateOpponentForm } from "./form";

export default function OpponentsPage() {
  const { tenant } = useTenantAndUserAccessContext();
  const { data: opponents, error } = useOpponents(tenant?.id.toString() ?? "");
  const [isAddOpponentOpen, setIsAddOpponentOpen] = useState(false);

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Opponents"
        description="Manage your organization's opponents"
        actions={
          <PermissionButton
            onClick={() => setIsAddOpponentOpen(true)}
            className="gap-2"
            permission={Permission.MANAGE_TEAM}
          >
            <Plus className="h-4 w-4" />
            Add Opponent
          </PermissionButton>
        }
      />

      {error && <div className="text-red-500">{error.message}</div>}

      {opponents && (
        <OpponentsDataTable
          data={opponents}
          tenantId={tenant?.id.toString() ?? ""}
          tenant={tenant!}
        />
      )}

      <ResponsiveSheet
        isOpen={isAddOpponentOpen}
        setIsOpen={setIsAddOpponentOpen}
        title="Add Opponent"
      >
        <div className="p-4">
          <CreateOpponentForm
            tenantId={tenant?.id.toString() ?? ""}
            setIsOpen={setIsAddOpponentOpen}
            tenant={tenant!}
          />
        </div>
      </ResponsiveSheet>
    </div>
  );
}
