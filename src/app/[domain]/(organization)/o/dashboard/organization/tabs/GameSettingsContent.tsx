"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationCard } from "../items/LocationCard";
import AddGameLocationForm from "../forms/AddGameLocationForm";

interface GameSettingsContentProps {
  domain: string;
}

export default function GameSettingsContent({
  domain,
}: GameSettingsContentProps) {
  const { data: tenant } = useTenantByDomain(domain);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-medium">Game Locations</CardTitle>

          <Button onClick={() => setIsAddLocationOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tenant?.gameLocations && tenant.gameLocations.length > 0 ? (
            tenant.gameLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                tenant={tenant}
                type="game"
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground col-span-full">
              No game locations added yet.
            </p>
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
