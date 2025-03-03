import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tenant,
  TenantForm,
  TenantType,
} from "@/entities/tenant/Tenant.schema";
import { Plus, AlertCircle } from "lucide-react";
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

      {/* Late Threshold Settings */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Check-in Settings
          </h3>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Late Check-in Threshold</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="lateThreshold" className="pb-2">
                Minutes after training start time before check-in is marked as
                late
              </Label>
              <div className="flex items-center gap-4 ">
                <Input
                  id="lateThreshold"
                  value={lateThreshold}
                  onChange={(e) => setLateThreshold(e.target.value)}
                  className="w-24"
                  type="number"
                  min="0"
                />

                <Button onClick={handleLateThresholdChange}>Save</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Training Locations */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Training Locations
          </h3>

          <Button onClick={() => setIsAddLocationOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
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
              <CardContent className="flex flex-col items-center justify-center h-[200px] text-amber-700">
                <p className="font-medium">No locations added yet - Required</p>
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

        <AddTrainingLocationForm
          open={isAddLocationOpen}
          onOpenChange={setIsAddLocationOpen}
          tenant={tenant}
          domain={domain}
        />
      </div>
    </div>
  );
}
