"use client";

import { PermissionButton } from "@/components/auth/PermissionButton";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Permission } from "@/entities/role/Role.permissions";
import { useRolesByTenant } from "@/entities/role/Role.query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTenantAndUserAccessContext } from "../../../../../../../components/auth/TenantAndUserAccessContext";
import { PageHeader } from "../../../../../../../components/ui/page-header";
import { RoleForm } from "./components/RoleForm";
import { RoleList } from "./components/RoleList";

export default function RolesPage() {
  return <RolesPageContent />;
}

function RolesPageContent() {
  const [isOpen, setIsOpen] = useState(false);
  const { tenant } = useTenantAndUserAccessContext();

  const { data: roles, isLoading: isLoadingRoles } = useRolesByTenant(
    tenant?.id!
  );

  if (isLoadingRoles) {
    return null;
  }

  if (!tenant) {
    return null;
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Roles"
        description="Manage roles and permissions for your organization"
        actions={
          <PermissionButton
            permission={Permission.MANAGE_SETTINGS_ROLES}
            allowSystemRole={true}
            onClick={() => setIsOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </PermissionButton>
        }
      />
      <div className="px-0">
        <div className="mt-4 md:px-0">
          <RoleList
            roles={roles || []}
            isLoading={isLoadingRoles}
            tenantId={tenant.id}
          />
        </div>
      </div>

      <ResponsiveSheet
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title="Add Role"
        description="Create a new role with custom permissions"
      >
        <RoleForm setIsParentModalOpen={setIsOpen} tenantId={tenant.id} />
      </ResponsiveSheet>
    </div>
  );
}
