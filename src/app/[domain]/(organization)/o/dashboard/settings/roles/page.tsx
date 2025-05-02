"use client";

import { useRolesByTenant } from "@/entities/role/Role.query";
import { RoleDomain, Permission } from "@/entities/role/Role.permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleList } from "./components/RoleList";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { RoleForm } from "./components/RoleForm";
import { PermissionButton } from "@/components/auth/PermissionButton";
import { useTenantAndUserAccessContext } from "../../../../../../../components/auth/TenantAndUserAccessContext";

export default function RolesPage() {
  return <RolesPageContent />;
}

function RolesPageContent() {
  const [isOpen, setIsOpen] = useState(false);
  const { tenant } = useTenantAndUserAccessContext();

  const { data: roles, isLoading: isLoadingRoles } = useRolesByTenant(
    tenant?.id
  );

  const managementRoles =
    roles?.filter((role) => role.domain === RoleDomain.MANAGEMENT) || [];
  const familyRoles =
    roles?.filter((role) => role.domain === RoleDomain.FAMILY) || [];
  const playerRoles =
    roles?.filter((role) => role.domain === RoleDomain.PLAYER) || [];

  if (isLoadingRoles) {
    return null;
  }

  if (!tenant) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <PermissionButton
          permission={Permission.MANAGE_USERS}
          allowSystemRole={true}
          onClick={() => setIsOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </PermissionButton>
      </div>

      <Tabs defaultValue="management" className="space-y-4">
        <TabsList>
          <TabsTrigger value="management">Management Roles</TabsTrigger>
          <TabsTrigger value="family">Family Roles</TabsTrigger>
          <TabsTrigger value="player">Player Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Management Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleList
                roles={managementRoles}
                isLoading={isLoadingRoles}
                domain={RoleDomain.MANAGEMENT}
                tenantId={tenant.id}
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
              <div className="rounded-lg border border-dashed p-4 mb-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Family Dashboard Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Family roles grant access to the family dashboard. These are
                    preset roles and cannot be edited. Users with these roles
                    can:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>View their children&apos;s profiles and information</li>
                    <li>Access training schedules and attendance records</li>
                    <li>Submit forms and manage attendance</li>
                    <li>Receive notifications and updates</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    No additional permissions are needed as all features are
                    automatically available in the family dashboard.
                  </p>
                </div>
              </div>
              <RoleList
                roles={familyRoles}
                isLoading={isLoadingRoles}
                domain={RoleDomain.FAMILY}
                tenantId={tenant.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="player" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Player Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed p-4 mb-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Player Dashboard Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Player roles grant access to the player dashboard. These are
                    preset roles and cannot be edited. Users with these roles
                    can:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>View their own profile and information</li>
                    <li>Access training schedules and attendance records</li>
                    <li>View team information and updates</li>
                    <li>Receive notifications and updates</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    No additional permissions are needed as all features are
                    automatically available in the player dashboard.
                  </p>
                </div>
              </div>
              <RoleList
                roles={playerRoles}
                isLoading={isLoadingRoles}
                domain={RoleDomain.PLAYER}
                tenantId={tenant.id}
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
        <RoleForm setIsParentModalOpen={setIsOpen} tenantId={tenant.id} />
      </ResponsiveSheet>
    </div>
  );
}
