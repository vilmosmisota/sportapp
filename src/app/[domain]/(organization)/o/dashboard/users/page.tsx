"use client";

import { useUsers } from "@/entities/user/User.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { PageHeader } from "@/components/ui/page-header";
import UsersTable from "./tables/UsersTable";
import AddUserForm from "./forms/AddUserForm";

export default function UsersPage({ params }: { params: { domain: string } }) {
  const { data: tenant } = useTenantByDomain(params.domain);
  const { data: users, error } = useUsers(tenant?.id.toString() ?? "");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  if (error) return <div>{error.message}</div>;

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Users"
        description="Manage your organization's users and their permissions"
        actions={
          <Button onClick={() => setIsAddUserOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        }
      />

      {users && (
        <UsersTable users={users} tenantId={tenant?.id.toString() ?? ""} />
      )}

      <ResponsiveSheet
        isOpen={isAddUserOpen}
        setIsOpen={setIsAddUserOpen}
        title="Add User"
      >
        <AddUserForm
          tenantId={tenant?.id.toString() ?? ""}
          setIsParentModalOpen={setIsAddUserOpen}
        />
      </ResponsiveSheet>
    </div>
  );
}
