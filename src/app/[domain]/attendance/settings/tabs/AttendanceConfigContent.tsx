import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { PermissionButton } from "@/composites/auth/PermissionButton";
import { Permission } from "@/entities/role/Role.permissions";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { Clock, Settings, SquarePen, UserCheck } from "lucide-react";
import { useState } from "react";
import EditAttendanceConfigForm from "../forms/EditAttendanceConfigForm";

type AttendanceConfigContentProps = {
  tenant?: Tenant;
};

export default function AttendanceConfigContent({
  tenant,
}: AttendanceConfigContentProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!tenant) {
    return null;
  }

  const attendanceConfig = tenant.tenantConfigs?.attendance;

  return (
    <>
      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Attendance Configuration"
      >
        <EditAttendanceConfigForm
          tenant={tenant}
          setSheetOpen={setIsEditOpen}
          setIsParentModalOpen={setIsEditOpen}
        />
      </ResponsiveSheet>

      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Attendance Configuration
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                Configure attendance tracking and check-in settings
              </span>
            </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-muted rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                Attendance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Late Threshold
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {attendanceConfig?.lateThreshold || 5} minutes
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Check-in Mode
                  </span>
                  <span className="text-sm font-semibold text-foreground capitalize">
                    {attendanceConfig?.checkInMode?.replace("_", " ") ||
                      "PIN 4 Digit"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Check-in Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-muted rounded-lg">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </div>
                Check-in Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <UserCheck className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Currently using{" "}
                  {attendanceConfig?.checkInMode?.replace("_", " ") ||
                    "PIN 4 Digit"}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Additional methods coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 bg-muted rounded-lg">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </div>
              Configuration Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">
                  Late Threshold
                </p>
                <p className="text-lg font-bold text-foreground">
                  {attendanceConfig?.lateThreshold || 5} min
                </p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <UserCheck className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">
                  Check-in Method
                </p>
                <p className="text-sm font-medium text-foreground">
                  {attendanceConfig?.checkInMode?.replace("_", " ") ||
                    "PIN 4 Digit"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
