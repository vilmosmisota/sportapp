"use client";

import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationCard } from "../items/LocationCard";
import AddGameLocationForm from "../forms/AddGameLocationForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface GameSettingsContentProps {
  domain: string;
}

export default function GameSettingsContent({
  domain,
}: GameSettingsContentProps) {
  const { data: tenant } = useTenantByDomain(domain);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);

  // Check if game locations are configured
  const hasGameLocations =
    tenant?.gameLocations && tenant.gameLocations.length > 0;

  return (
    <div className="space-y-6">
      {!hasGameLocations && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">
            Game Locations Required
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            Please add at least one game location to enable competition
            features. Game locations are required before you can manage
            opponents and games.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-medium">Game Locations</CardTitle>

          <Button onClick={() => setIsAddLocationOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hasGameLocations && tenant?.gameLocations ? (
            tenant.gameLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                tenant={tenant}
                type="game"
              />
            ))
          ) : (
            <Card className="col-span-full border-dashed border-amber-300">
              <CardContent className="flex flex-col items-center justify-center h-[200px] text-amber-700">
                <p className="font-medium">
                  No game locations added yet - Required
                </p>
                <p className="text-sm mt-2">
                  Add at least one game location to enable competition features
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
        </CardContent>
      </Card>

      <ResponsiveSheet
        isOpen={isAddLocationOpen}
        setIsOpen={setIsAddLocationOpen}
        title="Add Game Location"
      >
        <div className="p-4">
          <AddGameLocationForm
            tenantId={tenant?.id.toString() ?? ""}
            domain={domain}
            setIsOpen={setIsAddLocationOpen}
          />
        </div>
      </ResponsiveSheet>
    </div>
  );
}
