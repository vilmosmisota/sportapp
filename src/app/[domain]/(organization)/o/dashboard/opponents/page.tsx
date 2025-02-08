"use client";

import { useOpponents } from "@/entities/opponent/Opponent.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { PageHeader } from "@/components/ui/page-header";
import { useUserRoles } from "@/entities/user/hooks/useUserRoles";
import { Permissions } from "@/libs/permissions/permissions";
import OpponentForm from "./components/OpponentForm";
import { OpponentsDataTable } from "./components/OpponentsDataTable";

export default function OpponentsPage({
  params,
}: {
  params: { domain: string };
}) {
  const { data: tenant } = useTenantByDomain(params.domain);
  const { data: opponents, error } = useOpponents(tenant?.id.toString() ?? "");
  const [isAddOpponentOpen, setIsAddOpponentOpen] = useState(false);
  const userEntity = useUserRoles();
  const canManageOpponents = Permissions.Teams.manage(userEntity); // Using Teams permission for now

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Opponents"
        description="Manage your organization's opponents"
        actions={
          canManageOpponents && (
            <Button
              onClick={() => setIsAddOpponentOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Opponent
            </Button>
          )
        }
      />

      {error && <div className="text-red-500">{error.message}</div>}

      {opponents && (
        <OpponentsDataTable
          data={opponents}
          tenantId={tenant?.id.toString() ?? ""}
          canManage={canManageOpponents}
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
          />
        </div>
      </ResponsiveSheet>
    </div>
  );
}
