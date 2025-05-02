"use client";

import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Trophy, MapPin } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationCard } from "../items/LocationCard";
import AddGameLocationForm from "../forms/AddGameLocationForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CompetitionTypesContent from "./CompetitionTypesContent";
import { Separator } from "@/components/ui/separator";
import { Tenant } from "../../../../../../../../entities/tenant/Tenant.schema";

interface GameSettingsContentProps {
  tenant?: Tenant;
}

export default function GameSettingsContent({
  tenant,
}: GameSettingsContentProps) {
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isAddCompetitionTypeOpen, setIsAddCompetitionTypeOpen] =
    useState(false);

  // Check if game locations are configured
  const hasGameLocations =
    tenant?.gameLocations && tenant.gameLocations.length > 0;

  return (
    <div className="space-y-8">
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

      {/* Section Introduction */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Competition Management</h2>
        <p className="text-sm text-muted-foreground">
          Configure competition types and game locations for your organization
        </p>
      </div>

      {/* Competition Types Section */}
      <Card className="border">
        <CardHeader className="bg-secondary/30 py-2 px-6 border-b flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Trophy className="h-4 w-4" />
            Competition Types
          </CardTitle>
          <Button
            onClick={() => setIsAddCompetitionTypeOpen(true)}
            className="gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add Type
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <CompetitionTypesContent
            tenant={tenant}
            isAddOpen={isAddCompetitionTypeOpen}
            setIsAddOpen={setIsAddCompetitionTypeOpen}
            hideAddButton
          />
        </CardContent>
      </Card>

      {/* Game Locations Section */}
      <Card className="border">
        <CardHeader className="bg-secondary/30 py-2 px-6 border-b flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <MapPin className="h-4 w-4" />
            Game Locations
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
                Define locations where your games and matches take place
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <CardContent className="flex flex-col items-center justify-center h-[180px] text-amber-700">
                    <p className="font-medium">
                      No game locations added yet - Required
                    </p>
                    <p className="text-sm mt-2">
                      Add at least one game location to enable competition
                      features
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

      <ResponsiveSheet
        isOpen={isAddLocationOpen}
        setIsOpen={setIsAddLocationOpen}
        title="Add Game Location"
      >
        <div className="p-4">
          <AddGameLocationForm
            tenant={tenant}
            setIsOpen={setIsAddLocationOpen}
          />
        </div>
      </ResponsiveSheet>
    </div>
  );
}
