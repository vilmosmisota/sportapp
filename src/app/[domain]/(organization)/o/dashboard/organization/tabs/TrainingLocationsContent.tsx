import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddTrainingLocationForm from "../forms/AddTrainingLocationForm";
import LocationItem from "../items/LocationItem";

interface TrainingLocationsContentProps {
  tenant: Tenant | undefined;
  domain: string;
}

export default function TrainingLocationsContent({
  tenant,
  domain,
}: TrainingLocationsContentProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  if (!tenant) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Training Locations
        </h3>

        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
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
          <Card className="col-span-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <p>No locations added yet</p>
              <p className="text-sm">
                Click the + button to add your first location
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <AddTrainingLocationForm
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        tenant={tenant}
        domain={domain}
      />
    </div>
  );
}
