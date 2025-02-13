"use client";

import { useRolesByDomainAndTenantType } from "@/entities/role/Role.query";
import { Domain, TenantType } from "@/entities/role/Role.schema";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleList } from "./components/RoleList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { RoleForm } from "./components/RoleForm";

export default function RolesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const { data: tenant, isLoading: isLoadingTenant } = useTenantByDomain(
    params.domain as string
  );

  const { data: managementRoles, isLoading: isLoadingManagement } =
    useRolesByDomainAndTenantType(
      Domain.MANAGEMENT,
      tenant?.type as TenantType
    );
  const { data: familyRoles, isLoading: isLoadingFamily } =
    useRolesByDomainAndTenantType(Domain.FAMILY, tenant?.type as TenantType);

  if (isLoadingTenant) {
    return null; // or a loading spinner
  }

  if (!tenant) {
    return null; // or an error message
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Management"
        description="Manage roles and permissions for your organization"
        actions={
          <Button onClick={() => setIsOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        }
      />

      <Tabs defaultValue="management" className="space-y-4">
        <TabsList>
          <TabsTrigger value="management">Management Roles</TabsTrigger>
          <TabsTrigger value="family">Family Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Management Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleList
                roles={managementRoles || []}
                isLoading={isLoadingManagement}
                domain={Domain.MANAGEMENT}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Family Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleList
                roles={familyRoles || []}
                isLoading={isLoadingFamily}
                domain={Domain.FAMILY}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ResponsiveSheet
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title="Add Role"
        description="Create a new role with custom permissions"
      >
        <RoleForm setIsParentModalOpen={setIsOpen} tenantType={tenant.type} />
      </ResponsiveSheet>
    </div>
  );
}
