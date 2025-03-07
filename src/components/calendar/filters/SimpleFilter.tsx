"use client";

import * as React from "react";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { CalendarEvent } from "../EventCalendar";
import {
  startOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, FilterIcon, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/libs/tailwind/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Simple filter state type
interface SimpleFilterState {
  showGames: boolean;
  showTrainings: boolean;
  dateRange: "all" | "today" | "this-week" | "this-month" | "upcoming";
}

// Default filter state
const defaultFilterState: SimpleFilterState = {
  showGames: true,
  showTrainings: true,
  dateRange: "all",
};

export interface SimpleFilterProps {
  events: CalendarEvent[];
  onFilteredEventsChange: (events: CalendarEvent[]) => void;
  dateRange?: { start: Date; end: Date };
}

export function SimpleFilter({
  events,
  onFilteredEventsChange,
  dateRange,
}: SimpleFilterProps) {
  const [filter, setFilter] = useState<SimpleFilterState>({
    showGames: true,
    showTrainings: true,
    dateRange: "all",
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Prevent initial render cycle
  const isInitialMount = useRef(true);

  // Store previous filtered events to prevent unnecessary updates
  const prevFilteredEventsRef = useRef<CalendarEvent[]>([]);

  // Filter the events based on the current filter state
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Filter by event type
      if (event.type === "game" && !filter.showGames) return false;
      if (event.type === "training" && !filter.showTrainings) return false;

      // Filter by date range if applicable
      if (filter.dateRange === "all") {
        return true; // Show all events when "all" is selected
      } else if (filter.dateRange === "today") {
        const today = startOfDay(new Date());
        return isSameDay(event.start, today);
      } else if (filter.dateRange === "this-week") {
        const start = startOfWeek(new Date());
        const end = endOfWeek(new Date());
        return isWithinInterval(event.start, { start, end });
      } else if (filter.dateRange === "this-month") {
        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());
        return isWithinInterval(event.start, { start, end });
      } else if (filter.dateRange === "upcoming") {
        const today = startOfDay(new Date());
        return isBefore(today, event.start);
      }

      return true;
    });
  }, [events, filter]);

  // Helper function to check if arrays are different
  const areEventsChanged = (a: CalendarEvent[], b: CalendarEvent[]) => {
    if (a.length !== b.length) return true;

    // For simplicity, we're just checking if the IDs changed
    // A more thorough check would be to compare all properties
    const aIds = new Set(a.map((event) => event.id));
    return b.some((event) => !aIds.has(event.id));
  };

  // Update the filtered events only when they actually change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevFilteredEventsRef.current = filteredEvents;
      onFilteredEventsChange(filteredEvents);
      return;
    }

    // Only call onFilteredEventsChange if the filtered events actually changed
    if (areEventsChanged(prevFilteredEventsRef.current, filteredEvents)) {
      prevFilteredEventsRef.current = filteredEvents;
      onFilteredEventsChange(filteredEvents);
    }
  }, [filteredEvents, onFilteredEventsChange]);

  // Handle filter changes
  const updateFilter = useCallback((updates: Partial<SimpleFilterState>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilter(defaultFilterState);
  }, []);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;

    // Event type filters
    if (!filter.showGames || !filter.showTrainings) count += 1;

    // Date range filter
    if (filter.dateRange !== "upcoming") count += 1;

    return count;
  }, [filter]);

  // Generate filter badges
  const filterBadges = useMemo(() => {
    const badges = [];

    // Event type badge
    if (!filter.showGames || !filter.showTrainings) {
      const types = [];
      if (filter.showGames) types.push("Games");
      if (filter.showTrainings) types.push("Trainings");

      badges.push({
        id: "event-types",
        label: types.length > 0 ? `Only ${types.join(" & ")}` : "No events",
        variant: "default" as const,
      });
    }

    // Date range badge
    if (filter.dateRange !== "upcoming") {
      let label;
      switch (filter.dateRange) {
        case "today":
          label = "Today only";
          break;
        case "this-week":
          label = "This week";
          break;
        case "this-month":
          label = "This month";
          break;
        case "all":
          label = "All dates";
          break;
      }

      badges.push({
        id: "date-range",
        label,
        variant: "outline" as const,
      });
    }

    return badges;
  }, [filter]);

  // Filtered vs total count
  const hiddenCount = events.length - filteredEvents.length;

  return (
    <div className="space-y-2 mb-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={isExpanded ? "default" : "outline"}
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center"
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="outline" className="ml-1 px-1">
                {activeFilterCount}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-muted-foreground"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Filter status */}
        {hiddenCount > 0 && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Info className="h-4 w-4" />
            Showing {filteredEvents.length} of {events.length} events
          </span>
        )}
      </div>

      {/* Filter badges */}
      {filterBadges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterBadges.map((badge) => (
            <Badge key={badge.id} variant={badge.variant} className="pl-2 pr-1">
              {badge.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-full ml-1"
                onClick={resetFilters}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Filter panel */}
      <div
        className={cn(
          "grid grid-cols-1 transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded
            ? "grid-rows-[1fr] opacity-100 mt-4"
            : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <Card className="p-4">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Event type filters */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Event Types</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-games"
                      checked={filter.showGames}
                      onCheckedChange={(checked) =>
                        updateFilter({ showGames: !!checked })
                      }
                    />
                    <Label htmlFor="filter-games">Games</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-trainings"
                      checked={filter.showTrainings}
                      onCheckedChange={(checked) =>
                        updateFilter({ showTrainings: !!checked })
                      }
                    />
                    <Label htmlFor="filter-trainings">Trainings</Label>
                  </div>
                </div>
              </div>

              {/* Date range filters */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Date Range</h3>
                <RadioGroup
                  value={filter.dateRange}
                  onValueChange={(value) =>
                    updateFilter({ dateRange: value as any })
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-dates" />
                    <Label htmlFor="all-dates">All dates</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upcoming" id="upcoming" />
                    <Label htmlFor="upcoming">Upcoming events</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="today" id="today" />
                    <Label htmlFor="today">Today only</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="this-week" id="this-week" />
                    <Label htmlFor="this-week">This week</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="this-month" id="this-month" />
                    <Label htmlFor="this-month">This month</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
