"use client";

import * as React from "react";
import { useFilterContext } from "../FilterContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Placeholder season data
const mockSeasons = [
  { id: 1, name: "Season 2023-2024" },
  { id: 2, name: "Season 2022-2023" },
  { id: 3, name: "Season 2021-2022" },
];

export function SeasonFilter() {
  const { filters, updateFilters } = useFilterContext();

  const handleSeasonChange = (value: string) => {
    updateFilters({
      seasons: {
        selectedSeason: value === "all" ? null : parseInt(value, 10),
      },
    });
  };

  // Convert the current selectedSeason to a string for the Select component
  const currentValue =
    filters.seasons.selectedSeason === null
      ? "all"
      : filters.seasons.selectedSeason.toString();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Season</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Filter events by season.
      </p>

      <div className="space-y-2">
        <Label htmlFor="season-select">Select Season</Label>
        <Select value={currentValue} onValueChange={handleSeasonChange}>
          <SelectTrigger id="season-select">
            <SelectValue placeholder="All seasons" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All seasons</SelectItem>
            {mockSeasons.map((season) => (
              <SelectItem key={season.id} value={season.id.toString()}>
                {season.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
