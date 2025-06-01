import { PermissionButton } from "@/components/auth/PermissionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Permission } from "@/entities/role/Role.permissions";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { Clock, MapPin, Settings, SquarePen } from "lucide-react";
import { useState } from "react";
import EditTrainingDevelopmentForm from "../forms/EditTrainingDevelopmentForm";

type TrainingDevelopmentContentProps = {
  tenant?: Tenant;
};

export default function TrainingDevelopmentContent({
  tenant,
}: TrainingDevelopmentContentProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!tenant) {
    return null;
  }

  const developmentConfig = tenant.tenantConfigs?.development;

  return (
    <>
      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Training & Development Settings"
      >
        <EditTrainingDevelopmentForm
          tenant={tenant}
          setSheetOpen={setIsEditOpen}
          setIsParentModalOpen={setIsEditOpen}
        />
      </ResponsiveSheet>

      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Training & Development
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                Configure training settings and locations
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
          {/* Training Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-muted rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                Training Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Late Threshold
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {developmentConfig?.lateThreshold || 5} minutes
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-muted rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                Training Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {developmentConfig?.trainingLocations &&
              developmentConfig.trainingLocations.length > 0 ? (
                <div className="space-y-3">
                  {developmentConfig.trainingLocations.map(
                    (location, index) => (
                      <div
                        key={index}
                        className="p-3 border border-border rounded-lg bg-card"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {location.name && (
                              <p className="text-sm font-medium text-foreground truncate">
                                {location.name}
                              </p>
                            )}
                            <div className="text-xs text-muted-foreground space-y-1">
                              {location.streetAddress && (
                                <p>{location.streetAddress}</p>
                              )}
                              {(location.city || location.postcode) && (
                                <p>
                                  {location.city}
                                  {location.city && location.postcode && ", "}
                                  {location.postcode}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No training locations configured
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Add training locations for your organization
                  </p>
                </div>
              )}
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
                <MapPin className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">
                  Training Locations
                </p>
                <p className="text-lg font-bold text-foreground">
                  {developmentConfig?.trainingLocations?.length || 0}
                </p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">
                  Late Threshold
                </p>
                <p className="text-sm font-medium text-foreground">
                  {developmentConfig?.lateThreshold || 5} min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
