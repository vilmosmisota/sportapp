"use client";

import * as React from "react";
import { useFilterContext } from "../FilterContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar, Users } from "lucide-react";
import { cn } from "@/libs/tailwind/utils";

export function EventTypeFilter() {
  const { filters, updateFilters } = useFilterContext();
  const { games, trainings } = filters.eventTypes;

  const handleGameToggle = (checked: boolean) => {
    updateFilters({
      eventTypes: {
        ...filters.eventTypes,
        games: checked,
      },
    });
  };

  const handleTrainingToggle = (checked: boolean) => {
    updateFilters({
      eventTypes: {
        ...filters.eventTypes,
        trainings: checked,
      },
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Event Types</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Choose which types of events to display on the calendar.
      </p>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="filter-games"
            checked={games}
            onCheckedChange={handleGameToggle}
          />
          <div className="grid gap-1.5 leading-none">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <Label
                htmlFor="filter-games"
                className={cn(
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                  !games && "text-muted-foreground"
                )}
              >
                Games
              </Label>
            </div>
            {!games && (
              <p className="text-xs text-muted-foreground">
                Games are currently hidden
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="filter-trainings"
            checked={trainings}
            onCheckedChange={handleTrainingToggle}
          />
          <div className="grid gap-1.5 leading-none">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <Label
                htmlFor="filter-trainings"
                className={cn(
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                  !trainings && "text-muted-foreground"
                )}
              >
                Trainings
              </Label>
            </div>
            {!trainings && (
              <p className="text-xs text-muted-foreground">
                Trainings are currently hidden
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Show warning if both are disabled */}
      {!games && !trainings && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md text-sm text-yellow-800 dark:text-yellow-300">
          <p className="font-semibold">No events selected</p>
          <p className="text-xs mt-1">
            Enable at least one event type to see events on the calendar.
          </p>
        </div>
      )}
    </div>
  );
}
