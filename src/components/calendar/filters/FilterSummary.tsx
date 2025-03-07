"use client";

import * as React from "react";
import { useFilterContext } from "./FilterContext";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { GameStatus } from "@/entities/game/Game.schema";

export function FilterSummary({
  filteredCount,
  totalCount,
}: {
  filteredCount: number;
  totalCount: number;
}) {
  const { filters, activeFilterCount } = useFilterContext();

  if (activeFilterCount === 0) return null;

  // Generate human-readable descriptions of active filters
  const getFilterDescriptions = () => {
    const descriptions: { title: string; description: string }[] = [];

    // Event type filter
    if (!filters.eventTypes.games || !filters.eventTypes.trainings) {
      const showing = [];
      if (filters.eventTypes.games) showing.push("games");
      if (filters.eventTypes.trainings) showing.push("trainings");

      descriptions.push({
        title: "Event Types",
        description: `Showing only ${showing.join(" and ")}`,
      });
    }

    // Status filters
    const disabledGameStatuses = Object.entries(filters.statuses.gameStatuses)
      .filter(([_, enabled]) => !enabled)
      .map(([status]) => status);

    if (disabledGameStatuses.length > 0) {
      const statusLabels = disabledGameStatuses.map((status) => {
        const statusMap: Record<string, string> = {
          [GameStatus.Scheduled]: "Scheduled",
          [GameStatus.InProgress]: "In Progress",
          [GameStatus.Completed]: "Completed",
          [GameStatus.Canceled]: "Canceled",
          [GameStatus.Postponed]: "Postponed",
          [GameStatus.Forfeit]: "Forfeit",
          [GameStatus.Abandoned]: "Abandoned",
          [GameStatus.Draft]: "Draft",
        };
        return statusMap[status] || status;
      });

      descriptions.push({
        title: "Game Statuses",
        description: `Excluding ${statusLabels.join(", ")}`,
      });
    }

    // Training status filters
    if (filters.statuses.trainingAvailability) {
      const disabledTrainingStatuses = Object.entries(
        filters.statuses.trainingAvailability
      )
        .filter(([_, enabled]) => !enabled)
        .map(([status]) => status);

      if (disabledTrainingStatuses.length > 0) {
        const statusLabels = disabledTrainingStatuses.map((status) => {
          const statusMap: Record<string, string> = {
            available: "Available",
            full: "Full",
            cancelled: "Cancelled",
          };
          return statusMap[status] || status;
        });

        descriptions.push({
          title: "Training Statuses",
          description: `Excluding ${statusLabels.join(", ")}`,
        });
      }
    }

    // Team filter
    if (filters.teams.selectedTeams.length > 0) {
      descriptions.push({
        title: "Teams",
        description: `Filtered to ${filters.teams.selectedTeams.length} specific team(s)`,
      });
    }

    // Season filter
    if (filters.seasons.selectedSeason !== null) {
      descriptions.push({
        title: "Season",
        description: "Filtered to a specific season",
      });
    }

    // Location filter
    if (filters.locations.selectedLocations.length > 0) {
      descriptions.push({
        title: "Locations",
        description: `Filtered to ${filters.locations.selectedLocations.length} specific location(s)`,
      });
    }

    // Date range filter
    if (
      filters.dateRange.preset !== "upcoming" ||
      filters.dateRange.startDate ||
      filters.dateRange.endDate
    ) {
      let description = "Custom date range";

      switch (filters.dateRange.preset) {
        case "today":
          description = "Today only";
          break;
        case "this-week":
          description = "This week";
          break;
        case "this-month":
          description = "This month";
          break;
        case "past":
          description = "Past events only";
          break;
      }

      descriptions.push({
        title: "Date Range",
        description,
      });
    }

    return descriptions;
  };

  const filterDescriptions = getFilterDescriptions();
  const hiddenEventCount = totalCount - filteredCount;

  return (
    <Alert className="mb-4 bg-muted/50">
      <Info className="h-4 w-4" />
      <AlertTitle>Filters Applied</AlertTitle>
      <AlertDescription>
        <p className="text-sm mb-2">
          {hiddenEventCount > 0 ? (
            <>Hiding {hiddenEventCount} events based on your filters.</>
          ) : (
            <>All {totalCount} events match your filters.</>
          )}
        </p>

        <div className="flex flex-wrap gap-2 mt-2">
          {filterDescriptions.map((desc, idx) => (
            <Badge key={idx} variant="outline" className="px-2 py-1 gap-1.5">
              <span className="font-semibold">{desc.title}:</span>{" "}
              {desc.description}
            </Badge>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}
