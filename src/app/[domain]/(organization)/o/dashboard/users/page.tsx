"use client";

import { useUsers } from "@/entities/user/User.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";

import UsersTableFilters from "./tables/UsersTableFilters";
import { UserRole } from "@/entities/user/User.schema";
import UsersTable from "./tables/UsersTable";
import AddUserForm from "./forms/AddUserForm";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Permissions } from "@/libs/permissions/permissions";

export default function UsersPage({ params }: { params: { domain: string } }) {
  const { data: tenant } = useTenantByDomain(params.domain);
  const { data: users, error } = useUsers(tenant?.id.toString() ?? "");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const userRoles = useUserRoles();
  const canManageUsers = Permissions.Users.manage(userRoles);

  if (error) return <div>{error.message}</div>;

  const filteredUsers = users?.filter((user) => {
    const matchesRole =
      roleFilter === "all" ||
      user.entities?.some((entity) => entity.role === roleFilter);
    const matchesSearch =
      searchQuery === "" ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRole && matchesSearch;
  });

  return (
    <div className="w-full">
      <h3 className="text-lg mb-6">Users</h3>

      <div className="flex items-center space-x-4 mb-6">
        {canManageUsers && (
          <Button
            onClick={() => setIsAddUserOpen(true)}
            className="shrink-0 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        )}
        <UsersTableFilters
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      <div className="mt-4">
        <UsersTable
          users={filteredUsers}
          tenantId={tenant?.id.toString() ?? ""}
          canManageUsers={canManageUsers}
        />
      </div>

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
