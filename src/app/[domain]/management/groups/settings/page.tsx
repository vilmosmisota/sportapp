"use client";

import { PageHeader } from "@/components/ui/page-header";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { PermissionButton } from "@/composites/auth/PermissionButton";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { Permission } from "@/entities/role/Role.permissions";
import { SquarePen } from "lucide-react";
import { useState } from "react";
import GroupSettingsContent from "./components/GroupSettingsContent";
import EditGroupSettingsForm from "./forms/EditGroupSettingsForm";

export default function GroupsSettingsPage() {
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
        title="Edit Group Settings"
      >
        <EditGroupSettingsForm
          tenant={tenant}
          setSheetOpen={setIsEditOpen}
          setIsParentModalOpen={setIsEditOpen}
        />
      </ResponsiveSheet>

      <div className="w-full">
        <PageHeader
          title="Group Settings"
          description="Configure default appearance and available options for groups in your organization."
          actions={headerActions}
        />
        <div className="px-0 mt-6">
          <GroupSettingsContent tenant={tenant} />
        </div>
      </div>
    </>
  );
}
