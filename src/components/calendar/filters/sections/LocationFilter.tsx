"use client";

import * as React from "react";
import { useFilterContext } from "../FilterContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, MapPin } from "lucide-react";

// Placeholder location data
const mockLocations = [
  { id: 1, name: "City Stadium", address: "123 Main St" },
  { id: 2, name: "Sports Complex", address: "456 Park Ave" },
  { id: 3, name: "Training Ground", address: "789 Practice Rd" },
  { id: 4, name: "East Field", address: "321 East St" },
  { id: 5, name: "West Arena", address: "654 West Ave" },
];

export function LocationFilter() {
  const { filters, updateFilters } = useFilterContext();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleLocationToggle = (locationId: number, checked: boolean) => {
    const currentLocations = [...filters.locations.selectedLocations];

    if (checked) {
      // Add location to selection if not already selected
      if (!currentLocations.includes(locationId)) {
        updateFilters({
          locations: {
            selectedLocations: [...currentLocations, locationId],
          },
        });
      }
    } else {
      // Remove location from selection
      updateFilters({
        locations: {
          selectedLocations: currentLocations.filter((id) => id !== locationId),
        },
      });
    }
  };

  // Filter locations based on search query
  const filteredLocations = React.useMemo(() => {
    return mockLocations.filter(
      (location) =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Locations</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Filter events by location.
      </p>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search locations..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Location list */}
      <div className="h-[200px] overflow-auto mt-2">
        <div className="space-y-2">
          {filteredLocations.map((location) => (
            <div key={location.id} className="flex items-center space-x-2">
              <Checkbox
                id={`location-${location.id}`}
                checked={filters.locations.selectedLocations.includes(
                  location.id
                )}
                onCheckedChange={(checked) =>
                  handleLocationToggle(location.id, !!checked)
                }
              />
              <div className="grid gap-0.5 leading-none">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <Label
                    htmlFor={`location-${location.id}`}
                    className="text-sm font-medium leading-none"
                  >
                    {location.name}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-5">
                  {location.address}
                </p>
              </div>
            </div>
          ))}

          {filteredLocations.length === 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No locations found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      </div>

      {/* Show selected count */}
      {filters.locations.selectedLocations.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {filters.locations.selectedLocations.length} location
          {filters.locations.selectedLocations.length > 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}
