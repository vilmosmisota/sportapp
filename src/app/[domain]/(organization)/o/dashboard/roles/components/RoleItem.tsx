"use client";

import { Role } from "@/entities/role/Role.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, SquarePen, Trash2, Eye, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPermissionName } from "@/entities/role/Role.utils";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { RoleForm } from "./RoleForm";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";

interface RoleItemProps {
  role: Role;
  onDelete: (roleId: string) => void;
}

export function RoleItem({ role, onDelete }: RoleItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Group permissions by type
  const viewPermissions = role.permissions.filter((p) => p.startsWith("view_"));
  const managePermissions = role.permissions.filter((p) =>
    p.startsWith("manage_")
  );

  const ActionMenu = () => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-background/20 data-[state=open]:bg-background/20"
          size="sm"
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem className="group flex w-full items-center justify-between text-left p-0 text-sm font-medium text-neutral-700">
          <button
            onClick={() => setIsEditOpen(true)}
            className="w-full justify-start items-center gap-2 flex rounded-md p-2 transition-all duration-75 hover:bg-gray-100"
          >
            <SquarePen className="h-4 w-4" />
            Edit
          </button>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="group flex w-full items-center justify-between text-left p-0 text-sm font-medium text-neutral-700">
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="w-full justify-start items-center gap-2 flex text-red-500 rounded-md p-2 transition-all duration-75 hover:bg-gray-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

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
          domain={role.domain}
          tenantType={role.tenantType!}
          setIsParentModalOpen={setIsEditOpen}
        />
      </ResponsiveSheet>

      <ConfirmDeleteDialog
        categoryId={role.id}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        text="This will permanently delete this role and remove it from all users who have it assigned. Are you sure you want to proceed?"
        onConfirm={onDelete}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg font-semibold">{role.name}</CardTitle>
          </div>
          <ActionMenu />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-6">
            {role.domain === "family" ? (
              <div className="rounded-lg border border-dashed p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Family Dashboard Access</h4>
                  <p className="text-sm text-muted-foreground">
                    This role grants access to the family dashboard. Users with
                    this role can:
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
            ) : (
              <>
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
                          className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100"
                        >
                          {formatPermissionName(permission)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
