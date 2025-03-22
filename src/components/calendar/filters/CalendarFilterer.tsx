"use client";

import * as React from "react";
import { useMemo, useCallback, useState, useEffect } from "react";
import { useFilterContext } from "./FilterContext";
import { CalendarEvent } from "../EventCalendar";
import { Game, GameStatus } from "@/entities/game/Game.schema";
import { Training } from "@/entities/training/Training.schema";
import {
  startOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
  isAfter,
} from "date-fns";
import { toast } from "sonner";

interface CalendarFiltererProps {
  events: CalendarEvent[];
  isLoading: boolean;
  children: (props: {
    filteredEvents: CalendarEvent[];
    isLoading: boolean;
    filterInfo: {
      totalEvents: number;
      filteredCount: number;
      activeFilters: string[];
    };
  }) => React.ReactNode;
}

export function CalendarFilterer({
  events,
  isLoading,
  children,
}: CalendarFiltererProps) {
  const filterContext = useFilterContext();
  const [filterDebug, setFilterDebug] = useState(false);

  // Enable filter debugging with keyboard shortcut (Ctrl+Shift+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "F") {
        setFilterDebug((prev) => !prev);
        toast.info(`Filter debugging ${!filterDebug ? "enabled" : "disabled"}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filterDebug]);

  // Function to log filter operations in debug mode
  const logFilter = useCallback(
    (message: string, data?: any) => {
      if (filterDebug) {
        console.log(
          `%c[FILTER] ${message}`,
          "background: #6b21a8; color: white; padding: 2px 4px; border-radius: 2px;",
          data || ""
        );
      }
    },
    [filterDebug]
  );

  // Apply filters to events
  const filteredEvents = useMemo(() => {
    if (!events.length) {
      logFilter("No events to filter");
      return [];
    }

    if (!filterContext) {
      logFilter("No filter context available");
      return events;
    }

    const { filters } = filterContext;
    logFilter("Applying filters", { filters, eventCount: events.length });

    // Track active filters
    const activeFilters: string[] = [];

    // Begin filtering
    const result = events.filter((event) => {
      // Filter by event type
      if (event.type === "game" && !filters.eventTypes.games) {
        logFilter(`Filtering out game: ${event.title}`);
        return false;
      }
      if (event.type === "training" && !filters.eventTypes.trainings) {
        logFilter(`Filtering out training: ${event.title}`);
        return false;
      }

      // Filter by status
      if (event.type === "game") {
        const game = event.data as Game;
        if (!filters.statuses.gameStatuses[game.status as GameStatus]) {
          logFilter(`Filtering out game by status: ${game.status}`);
          return false;
        }
      }

      // Filter by team
      if (filters.teams.selectedTeams.length > 0) {
        activeFilters.push("teams");

        if (event.type === "game") {
          const game = event.data as Game;
          const homeTeamId = game.homeTeam?.id;
          const awayTeamId = game.awayTeam?.id;

          if (!homeTeamId && !awayTeamId) {
            logFilter(`Filtering out game with no teams: ${event.title}`);
            return false;
          }

          const hasSelectedTeam = filters.teams.selectedTeams.some(
            (teamId) => teamId === homeTeamId || teamId === awayTeamId
          );

          if (!hasSelectedTeam) {
            logFilter(
              `Filtering out game not matching team filter: ${event.title}`
            );
            return false;
          }
        } else if (event.type === "training") {
          const training = event.data as Training;
          if (!training.team?.id) {
            logFilter(`Filtering out training with no team: ${event.title}`);
            return false;
          }

          if (!filters.teams.selectedTeams.includes(training.team.id)) {
            logFilter(
              `Filtering out training not matching team filter: ${event.title}`
            );
            return false;
          }
        }
      }

      // Filter by season
      if (filters.seasons.selectedSeason !== null) {
        activeFilters.push("season");

        if (event.type === "game") {
          const game = event.data as Game;
          if (game.seasonId !== filters.seasons.selectedSeason) {
            logFilter(
              `Filtering out game not in selected season: ${event.title}`
            );
            return false;
          }
        } else if (event.type === "training") {
          const training = event.data as Training;
          const hasSelectedSeason =
            training.seasonId === filters.seasons.selectedSeason;

          if (!hasSelectedSeason) {
            logFilter(
              `Filtering out training not in selected season: ${event.title}`
            );
            return false;
          }
        }
      }

      // Filter by location
      if (filters.locations.selectedLocations.length > 0) {
        activeFilters.push("locations");

        if (event.type === "game") {
          const game = event.data as Game;
          if (!game.location?.id) {
            logFilter(`Filtering out game with no location: ${event.title}`);
            return false;
          }

          if (!filters.locations.selectedLocations.includes(game.location.id)) {
            logFilter(
              `Filtering out game not at selected location: ${event.title}`
            );
            return false;
          }
        } else if (event.type === "training") {
          const training = event.data as Training;
          if (!training.location?.id) {
            logFilter(
              `Filtering out training with no location: ${event.title}`
            );
            return false;
          }

          if (
            !filters.locations.selectedLocations.includes(training.location.id)
          ) {
            logFilter(
              `Filtering out training not at selected location: ${event.title}`
            );
            return false;
          }
        }
      }

      // Filter by date range
      const { preset, startDate, endDate } = filters.dateRange;
      if (preset !== "upcoming" || startDate || endDate) {
        activeFilters.push("dateRange");
      }

      const today = startOfDay(new Date());

      switch (preset) {
        case "today":
          if (!isSameDay(event.start, today)) {
            logFilter(`Filtering out event not today: ${event.title}`);
            return false;
          }
          break;

        case "this-week": {
          const weekStart = startOfWeek(today, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

          if (
            !isWithinInterval(event.start, { start: weekStart, end: weekEnd })
          ) {
            logFilter(`Filtering out event not this week: ${event.title}`);
            return false;
          }
          break;
        }

        case "this-month": {
          const monthStart = startOfMonth(today);
          const monthEnd = endOfMonth(today);

          if (
            !isWithinInterval(event.start, { start: monthStart, end: monthEnd })
          ) {
            logFilter(`Filtering out event not this month: ${event.title}`);
            return false;
          }
          break;
        }

        case "upcoming":
          if (isBefore(event.start, today) && !isSameDay(event.start, today)) {
            logFilter(`Filtering out past event: ${event.title}`);
            return false;
          }
          break;

        case "past":
          if (!isBefore(event.start, today)) {
            logFilter(`Filtering out non-past event: ${event.title}`);
            return false;
          }
          break;

        case "custom":
          if (
            startDate &&
            isBefore(event.start, startDate) &&
            !isSameDay(event.start, startDate)
          ) {
            logFilter(
              `Filtering out event before custom start date: ${event.title}`
            );
            return false;
          }
          if (
            endDate &&
            isAfter(event.start, endDate) &&
            !isSameDay(event.start, endDate)
          ) {
            logFilter(
              `Filtering out event after custom end date: ${event.title}`
            );
            return false;
          }
          break;
      }

      // Event passed all filters
      return true;
    });

    logFilter(
      `Filtered ${events.length} events down to ${result.length} events`
    );
    return result;
  }, [events, filterContext, logFilter]);

  // Calculate filter information
  const filterInfo = {
    totalEvents: events.length,
    filteredCount: events.length - filteredEvents.length,
    activeFilters: filterContext
      ? Object.entries(filterContext.filters)
          .filter(([_, value]) => {
            if (typeof value === "object" && value !== null) {
              if (Array.isArray(value)) return value.length > 0;
              if ("selectedTeams" in value)
                return value.selectedTeams.length > 0;
              if ("selectedLocations" in value)
                return value.selectedLocations.length > 0;
              if ("selectedSeason" in value)
                return value.selectedSeason !== null;
              if ("preset" in value) return value.preset !== "upcoming";
            }
            return false;
          })
          .map(([key]) => key)
      : [],
  };

  return (
    <>
      {children({
        filteredEvents,
        isLoading,
        filterInfo,
      })}
    </>
  );
}
