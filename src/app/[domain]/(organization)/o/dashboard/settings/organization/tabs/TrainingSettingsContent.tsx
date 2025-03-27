import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tenant,
  TenantForm,
  TenantType,
} from "@/entities/tenant/Tenant.schema";
import { Plus, AlertCircle, Clock, MapPin, Save } from "lucide-react";
import { useState } from "react";
import AddTrainingLocationForm from "../forms/AddTrainingLocationForm";
import LocationItem from "../items/LocationItem";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUpdateTenant } from "@/entities/tenant/Tenant.actions.client";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TrainingSettingsContentProps {
  tenant: Tenant | undefined;
  domain: string;
}

export default function TrainingSettingsContent({
  tenant,
  domain,
}: TrainingSettingsContentProps) {
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [lateThreshold, setLateThreshold] = useState(
    tenant?.lateThresholdMinutes?.toString() ?? "5"
  );

  const updateTenant = useUpdateTenant(tenant?.id?.toString() ?? "", domain);

  if (!tenant) return null;

  // Check if training locations are configured
  const hasTrainingLocations =
    tenant.trainingLocations && tenant.trainingLocations.length > 0;

  const handleLateThresholdChange = async () => {
    try {
      const updateData: TenantForm = {
        name: tenant.name,
        type: tenant.type,
        domain: tenant.domain,
        sport: tenant.sport,
        membershipCurrency: tenant.membershipCurrency,
        lateThresholdMinutes: parseInt(lateThreshold),
        email: tenant.email ?? undefined,
        description: tenant.description ?? undefined,
        logo: tenant.logo ?? undefined,
        location: tenant.location ?? undefined,
        phoneNumber: tenant.phoneNumber ?? undefined,
        groupTypes: tenant.groupTypes ?? undefined,
        trainingLocations: tenant.trainingLocations ?? undefined,
        isPublicSitePublished: tenant.isPublicSitePublished,
      };

      await updateTenant.mutateAsync(updateData);
      toast.success("Late threshold updated successfully");
    } catch (error) {
      toast.error("Failed to update late threshold");
    }
  };

  return (
    <div className="space-y-8">
      {!hasTrainingLocations && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">
            Training Locations Required
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            Please add at least one training location to enable training and
            attendance features. Training locations are required before you can
            schedule trainings or track attendance.
          </AlertDescription>
        </Alert>
      )}

      {/* Section Introduction */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Training Management</h2>
        <p className="text-sm text-muted-foreground">
          Configure training settings and locations for your organization
        </p>
      </div>

      {/* Late Threshold Settings */}
      <Card className="border">
        <CardHeader className="bg-secondary/30 py-2 px-6 border-b flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Clock className="h-4 w-4" />
            Check-in Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Late Check-in Threshold</h3>
              <p className="text-sm text-muted-foreground">
                Define how many minutes after training start time a check-in is
                marked as late
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Input
                id="lateThreshold"
                value={lateThreshold}
                onChange={(e) => setLateThreshold(e.target.value)}
                className="w-24"
                type="number"
                min="0"
              />

              <Button
                onClick={handleLateThresholdChange}
                size="sm"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Locations */}
      <Card className="border">
        <CardHeader className="bg-secondary/30 py-2 px-6 border-b flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <MapPin className="h-4 w-4" />
            Training Locations
          </CardTitle>
          <Button
            onClick={() => setIsAddLocationOpen(true)}
            className="gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Define locations where your training sessions take place
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {tenant.trainingLocations?.map((location) => (
                <LocationItem
                  key={location.id}
                  location={location}
                  tenant={tenant}
                  domain={domain}
                />
              ))}
              {(!tenant.trainingLocations ||
                tenant.trainingLocations.length === 0) && (
                <Card className="col-span-2 border-dashed border-amber-300">
                  <CardContent className="flex flex-col items-center justify-center h-[180px] text-amber-700">
                    <p className="font-medium">
                      No locations added yet - Required
                    </p>
                    <p className="text-sm mt-2">
                      Add at least one training location to enable training and
                      attendance features
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 border-amber-400 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                      onClick={() => setIsAddLocationOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Location
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AddTrainingLocationForm
        open={isAddLocationOpen}
        onOpenChange={setIsAddLocationOpen}
        tenant={tenant}
        domain={domain}
      />
    </div>
  );
}
