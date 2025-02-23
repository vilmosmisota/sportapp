"use client";

import { useOpponents } from "@/entities/opponent/Opponent.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { PageHeader } from "@/components/ui/page-header";
import { PermissionButton } from "@/components/auth/PermissionButton";
import { Permission } from "@/entities/role/Role.permissions";

import OpponentForm from "./components/OpponentForm";
import OpponentsDataTable from "./components/OpponentsDataTable";

export default function OpponentsPage({
  params,
}: {
  params: { domain: string };
}) {
  const { data: tenant } = useTenantByDomain(params.domain);
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
          <OpponentForm
            tenantId={tenant?.id.toString() ?? ""}
            setIsOpen={setIsAddOpponentOpen}
            tenant={tenant!}
          />
        </div>
      </ResponsiveSheet>
    </div>
  );
}
