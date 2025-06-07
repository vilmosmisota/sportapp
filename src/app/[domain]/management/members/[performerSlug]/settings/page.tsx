"use client";

import { PageHeader } from "@/components/ui/page-header";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { PermissionButton } from "@/composites/auth/PermissionButton";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { getTenantPerformerName } from "@/entities/member/Member.utils";
import { Permission } from "@/entities/role/Role.permissions";
import { SquarePen } from "lucide-react";
import { useState } from "react";
import PerformerSettingsContent from "./components/PerformerSettingsContent";
import EditPerformerSettingsForm from "./forms/EditPerformerSettingsForm";

export default function PerformerSettingsPage() {
  const { tenant } = useTenantAndUserAccessContext();
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!tenant) {
    return (
      <div className="w-full">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-muted-foreground">
            Loading...
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Loading tenant information.
          </p>
        </div>
      </div>
    );
  }

  const displayName = getTenantPerformerName(tenant);

  const headerActions = (
    <PermissionButton
      permission={Permission.MANAGE_SETTINGS_ORGANIZATION}
      onClick={() => setIsEditOpen(true)}
      className="gap-2"
    >
      <SquarePen className="h-4 w-4" />
      Edit Settings
    </PermissionButton>
  );

  return (
    <>
      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Performer Settings"
      >
        <EditPerformerSettingsForm
          tenant={tenant}
          setSheetOpen={setIsEditOpen}
          setIsParentModalOpen={setIsEditOpen}
        />
      </ResponsiveSheet>

      <div className="w-full">
        <PageHeader
          title={`Performers Settings`}
          description={`Performers are the people who perform the activities in your organization (players, dancers, etc.). You can manage their settings here.`}
          actions={headerActions}
        />
        <div className="px-0 mt-6">
          <PerformerSettingsContent tenant={tenant} />
        </div>
      </div>
    </>
  );
}
