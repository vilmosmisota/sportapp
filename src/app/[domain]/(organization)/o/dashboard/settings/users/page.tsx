"use client";

import { PermissionButton } from "@/components/auth/PermissionButton";
import { Permission } from "@/entities/role/Role.permissions";
import { useUsers } from "@/entities/user/User.query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTenantAndUserAccessContext } from "../../../../../../../components/auth/TenantAndUserAccessContext";
import { PageHeader } from "../../../../../../../components/ui/page-header";
import { ResponsiveSheet } from "../../../../../../../components/ui/responsive-sheet";
import AddUserForm from "./forms/AddUserForm";
import UsersTable from "./tables/UsersTable";

export default function UsersPage() {
  const { tenant } = useTenantAndUserAccessContext();
  const {
    data: users,
    error,
    isLoading,
  } = useUsers(tenant?.id.toString() ?? "");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  if (isLoading) {
    return null;
  }

  if (error) {
    return <div>Error loading users: {error.message}</div>;
  }

  if (!tenant) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Users"
        description="Manage users and their access to your organization"
        actions={
          <PermissionButton
            permission={Permission.MANAGE_SETTINGS_USERS}
            allowSystemRole={true}
            onClick={() => setIsAddUserOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </PermissionButton>
        }
      />

      <UsersTable users={users || []} tenantId={tenant.id.toString()} />

      <ResponsiveSheet
        isOpen={isAddUserOpen}
        setIsOpen={setIsAddUserOpen}
        title="Add User"
      >
        <AddUserForm
          tenantId={tenant.id.toString()}
          setIsParentModalOpen={setIsAddUserOpen}
        />
      </ResponsiveSheet>
    </div>
  );
}
