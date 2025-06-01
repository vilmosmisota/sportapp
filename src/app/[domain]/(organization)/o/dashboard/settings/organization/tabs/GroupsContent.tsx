import { PermissionButton } from "@/components/auth/PermissionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Permission } from "@/entities/role/Role.permissions";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { Settings, SquarePen } from "lucide-react";
import { useState } from "react";
import EditGroupsForm from "../forms/EditGroupsForm";

type GroupsContentProps = {
  tenant?: Tenant;
};

export default function GroupsContent({ tenant }: GroupsContentProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!tenant) {
    return null;
  }

  const groupsConfig = tenant.tenantConfigs?.groups;

  return (
    <>
      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Groups Settings"
      >
        <EditGroupsForm
          tenant={tenant}
          setSheetOpen={setIsEditOpen}
          setIsParentModalOpen={setIsEditOpen}
        />
      </ResponsiveSheet>

      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Groups</h2>
          </div>
          <PermissionButton
            permission={Permission.MANAGE_SETTINGS_ORGANIZATION}
            onClick={() => setIsEditOpen(true)}
            className="gap-2"
          >
            <SquarePen className="h-4 w-4" />
            Edit Settings
          </PermissionButton>
        </div>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 bg-muted rounded-lg">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </div>
              Display Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm font-medium text-muted-foreground">
                  Display Name
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {groupsConfig?.displayName || "Groups"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-muted-foreground">
                  URL Slug
                </span>
                <span className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">
                  /{groupsConfig?.slug || "groups"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
