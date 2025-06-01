import { PermissionButton } from "@/components/auth/PermissionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Permission } from "@/entities/role/Role.permissions";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { SquarePen, Users } from "lucide-react";
import { useState } from "react";
import EditMembersForm from "../forms/EditMembersForm";

type MembersContentProps = {
  tenant?: Tenant;
};

export default function MembersContent({ tenant }: MembersContentProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!tenant) {
    return null;
  }

  const performersConfig = tenant.tenantConfigs?.performers;

  return (
    <>
      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Members Settings"
      >
        <EditMembersForm
          tenant={tenant}
          setSheetOpen={setIsEditOpen}
          setIsParentModalOpen={setIsEditOpen}
        />
      </ResponsiveSheet>

      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Members</h2>
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

        {/* Performers Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 bg-muted rounded-lg">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              Performers Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Configure how individual performers (players, athletes, etc.) are
              displayed and accessed within your organization.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm font-medium text-muted-foreground">
                  Performer Display Name
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {performersConfig?.displayName || "Performers"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Performer URL Slug
                </span>
                <span className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">
                  /{performersConfig?.slug || "performers"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
