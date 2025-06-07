"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { PermissionDropdownMenu } from "@/composites/auth/PermissionDropdownMenu";
import { Permission } from "@/entities/role/Role.permissions";
import { Access, Role } from "@/entities/role/Role.schema";
import { formatPermissionName } from "@/entities/role/Role.utils";
import { Eye, Settings, Shield, SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { RoleForm } from "./RoleForm";

interface RoleItemProps {
  role: Role;
  onDelete: (roleId: number) => void;
  tenantId: number;
}

export function RoleItem({ role, onDelete, tenantId }: RoleItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDelete = () => {
    onDelete(role.id);
  };

  // Group permissions by type
  const viewPermissions = role.permissions.filter((p) => p.startsWith("view_"));
  const managePermissions = role.permissions.filter((p) =>
    p.startsWith("manage_")
  );

  // Get access badge styles
  const getAccessBadgeStyle = (accessType: Access) => {
    switch (accessType) {
      case Access.MANAGEMENT:
        return "bg-blue-50 text-blue-700 hover:bg-blue-100";
      case Access.KIOSK:
        return "bg-green-50 text-green-700 hover:bg-green-100";
      case Access.SYSTEM:
        return "bg-purple-50 text-purple-700 hover:bg-purple-100";
      default:
        return "bg-gray-50 text-gray-700 hover:bg-gray-100";
    }
  };

  return (
    <>
      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Role"
        description="Modify role details and permissions"
      >
        <RoleForm
          initialData={role}
          tenantId={tenantId}
          setIsParentModalOpen={setIsEditOpen}
        />
      </ResponsiveSheet>

      <ConfirmDeleteDialog
        categoryId={role.id.toString()}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        text="This will permanently delete this role and remove it from all users who have it assigned. Are you sure you want to proceed?"
        onConfirm={handleDelete}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">
                {role.name}
              </CardTitle>
              {role.access && role.access.length > 0 && (
                <div className="flex gap-1">
                  {role.access.map((accessType) => (
                    <Badge
                      key={accessType}
                      variant="secondary"
                      className={`text-xs capitalize ${getAccessBadgeStyle(
                        accessType
                      )}`}
                    >
                      {accessType}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          {role.tenantId && (
            <PermissionDropdownMenu
              actions={[
                {
                  label: "Edit",
                  onClick: () => setIsEditOpen(true),
                  icon: <SquarePen className="h-4 w-4" />,
                  permission: Permission.MANAGE_SETTINGS_ROLES,
                },
                {
                  label: "Delete",
                  onClick: () => setIsDeleteOpen(true),
                  icon: <Trash2 className="h-4 w-4" />,
                  permission: Permission.MANAGE_SETTINGS_ROLES,
                  variant: "destructive",
                },
              ]}
            />
          )}
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-6">
            {role.access && role.access.length > 0 && (
              <div>
                <div className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
                    <Shield className="h-4 w-4" />
                    <span>Access Types</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.access.map((accessType) => (
                    <Badge
                      key={accessType}
                      variant="secondary"
                      className={`text-xs capitalize ${getAccessBadgeStyle(
                        accessType
                      )}`}
                    >
                      {accessType}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {viewPermissions.length > 0 && (
              <div>
                <div className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
                    <Eye className="h-4 w-4" />
                    <span>View Permissions</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {viewPermissions.map((permission) => (
                    <Badge
                      key={permission}
                      variant="secondary"
                      className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      {formatPermissionName(permission)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {managePermissions.length > 0 && (
              <div>
                <div className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
                    <Settings className="h-4 w-4" />
                    <span>Manage Permissions</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {managePermissions.map((permission) => (
                    <Badge
                      key={permission}
                      variant="secondary"
                      className="text-xs bg-green-50 text-green-700 hover:bg-green-100"
                    >
                      {formatPermissionName(permission)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
