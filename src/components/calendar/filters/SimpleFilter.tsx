"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { CalendarEvent } from "../EventCalendar";
import {
  Check,
  Filter,
  Trophy,
  Dumbbell,
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/libs/tailwind/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Game } from "@/entities/game/Game.schema";
import { Training } from "@/entities/training/Training.schema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TeamGroup } from "../types";

// Define our simplified filter types
interface FilterOptions {
  eventTypes: {
    games: boolean;
    trainings: boolean;
  };
  teams: {
    tenantTeams: string[];
    opponentTeams: string[];
  };
}

// Interface for our filter team with the properties we need
interface FilterTeam {
  id: string;
  tenantId?: number;
  name?: string | null;
  color?: string | null;
  age?: string | null;
  gender?: string | null;
  skill?: string | null;
  isOpponent: boolean;
}

interface SimpleFilterProps {
  events: CalendarEvent[];
  tenantId: string;
  tenantName: string;
  onFilteredEventsChange: (filteredEvents: CalendarEvent[]) => void;
}

export function SimpleFilter({
  events,
  tenantId,
  tenantName,
  onFilteredEventsChange,
}: SimpleFilterProps) {
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    eventTypes: { games: true, trainings: true },
    teams: { tenantTeams: [], opponentTeams: [] },
  });

  // UI state
  const [activeValue, setActiveValue] = useState("filters");

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (!filters.eventTypes.games || !filters.eventTypes.trainings) count += 1;
    if (filters.teams.tenantTeams.length > 0) count += 1;
    if (filters.teams.opponentTeams.length > 0) count += 1;
    return count;
  }, [filters]);

  // Extract teams from events data
  const { tenantTeams, opponentTeams } = useMemo(() => {
    const tenantTeamsMap = new Map<string, FilterTeam>();
    const opponentTeamsMap = new Map<string, FilterTeam>();

    for (const event of events) {
      if (event.type === "game") {
        const game = event.data as Game;
        processGameTeams(game, tenantTeamsMap, opponentTeamsMap);
      } else if (event.type === "training") {
        const training = event.data as Training;
        processTrainingTeam(training, tenantTeamsMap);
      }
    }

    return {
      tenantTeams: Array.from(tenantTeamsMap.values()),
      opponentTeams: Array.from(opponentTeamsMap.values()),
    };
  }, [events, tenantId]);

  // Process events through the filter criteria
  const filteredEvents = useMemo(() => {
    // Apply type filter first
    const typeFilteredEvents = events.filter((event) => {
      if (event.type === "game" && !filters.eventTypes.games) {
        return false;
      }
      if (event.type === "training" && !filters.eventTypes.trainings) {
        return false;
      }
      return true;
    });

    // If no team filters are applied, return all events that passed the type filter
    if (
      filters.teams.tenantTeams.length === 0 &&
      filters.teams.opponentTeams.length === 0
    ) {
      return typeFilteredEvents;
    }

    // Apply team filters
    return typeFilteredEvents.filter((event) => {
      if (event.type === "game") {
        return matchesGameFilters(event.data as Game);
      }

      if (event.type === "training") {
        const training = event.data as Training;

        // No tenant team filters - show all trainings
        if (filters.teams.tenantTeams.length === 0) {
          return true;
        }

        // No team or no team ID - can't match filters
        if (!training.team || training.team.id === null) {
          return false;
        }

        // Check if team ID is in selected teams
        return filters.teams.tenantTeams.includes(String(training.team.id));
      }

      // Unknown event type
      return false;
    });
  }, [events, filters, tenantId]);

  // Notify parent of filtered events
  useEffect(() => {
    onFilteredEventsChange(filteredEvents);
  }, [filteredEvents, onFilteredEventsChange]);

  // Helper: Process game teams for categorization
  function processGameTeams(
    game: Game,
    tenantTeamsMap: Map<string, FilterTeam>,
    opponentTeamsMap: Map<string, FilterTeam>
  ) {
    // Process home team
    if (game.homeTeam) {
      const isObject =
        typeof game.homeTeam === "object" && game.homeTeam !== null;
      const teamId = isObject
        ? String(game.homeTeam.id)
        : String(game.homeTeam);

      if (teamId) {
        const isOpponent = isObject
          ? String(game.homeTeam.tenantId) !== tenantId
          : false;
        const team = createTeamObject(game.homeTeam, isObject, isOpponent);

        if (team) {
          (isOpponent ? opponentTeamsMap : tenantTeamsMap).set(teamId, team);
        }
      }
    }

    // Process away team
    if (game.awayTeam) {
      const isObject =
        typeof game.awayTeam === "object" && game.awayTeam !== null;
      const teamId = isObject
        ? String(game.awayTeam.id)
        : String(game.awayTeam);

      if (teamId) {
        const isOpponent = isObject
          ? String(game.awayTeam.tenantId) !== tenantId
          : true;
        const team = createTeamObject(game.awayTeam, isObject, isOpponent);

        if (team) {
          (isOpponent ? opponentTeamsMap : tenantTeamsMap).set(teamId, team);
        }
      }
    }

    // Process explicit opponent team
    if (game.opponentTeam) {
      const isObject =
        typeof game.opponentTeam === "object" && game.opponentTeam !== null;

      if (isObject) {
        const opponentId =
          game.opponentTeam.id?.toString() ||
          game.opponentTeam.opponentId?.toString();

        if (opponentId) {
          const team: FilterTeam = {
            id: opponentId,
            tenantId: game.opponentTeam.tenantId,
            name: game.opponentTeam.name || "Opponent",
            color: game.opponentTeam.appearance?.color,
            age: game.opponentTeam.age,
            gender: game.opponentTeam.gender,
            skill: game.opponentTeam.skill,
            isOpponent: true,
          };

          opponentTeamsMap.set(opponentId, team);
        }
      } else {
        const opponentId = String(game.opponentTeam);
        if (opponentId) {
          opponentTeamsMap.set(opponentId, {
            id: opponentId,
            name: opponentId,
            isOpponent: true,
          });
        }
      }
    }
  }

  // Helper: Process training team for categorization
  function processTrainingTeam(
    training: Training,
    teamsMap: Map<string, FilterTeam>
  ) {
    if (training.team?.id) {
      const teamId = String(training.team.id);

      teamsMap.set(teamId, {
        id: teamId,
        tenantId: Number(tenantId),
        name: training.team.name,
        color: training.team.appearance?.color,
        age: training.team.age,
        gender: training.team.gender,
        skill: training.team.skill,
        isOpponent: false,
      });
    }
  }

  // Helper: Create team object from team data
  function createTeamObject(
    team: any,
    isObject: boolean,
    isOpponent: boolean
  ): FilterTeam | null {
    if (!team) return null;

    const teamId = isObject ? String(team.id) : String(team);
    if (!teamId) return null;

    return {
      id: teamId,
      tenantId: isObject ? team.tenantId : undefined,
      name: isObject ? team.name : String(team),
      color: isObject ? team.appearance?.color : undefined,
      age: isObject ? team.age : undefined,
      gender: isObject ? team.gender : undefined,
      skill: isObject ? team.skill : undefined,
      isOpponent,
    };
  }

  // Helper: Check if game matches current filters
  function matchesGameFilters(game: Game): boolean {
    // Extract team information
    const homeTeamInfo = extractTeamInfo(game.homeTeam, false);
    const awayTeamInfo = extractTeamInfo(game.awayTeam, true);
    const opponentInfo = extractOpponentInfo(game.opponentTeam);

    // Check tenant team filters
    let hasTenantTeam = filters.teams.tenantTeams.length === 0;

    // Check if home team matches tenant team filters
    if (!hasTenantTeam && homeTeamInfo.id && !homeTeamInfo.isOpponent) {
      hasTenantTeam = filters.teams.tenantTeams.includes(homeTeamInfo.id);
    }

    // Check if away team matches tenant team filters
    if (!hasTenantTeam && awayTeamInfo.id && !awayTeamInfo.isOpponent) {
      hasTenantTeam = filters.teams.tenantTeams.includes(awayTeamInfo.id);
    }

    // Check opponent team filters
    let hasOpponentTeam = filters.teams.opponentTeams.length === 0;

    // Check if home team matches opponent filters
    if (!hasOpponentTeam && homeTeamInfo.id && homeTeamInfo.isOpponent) {
      hasOpponentTeam = filters.teams.opponentTeams.includes(homeTeamInfo.id);
    }

    // Check if away team matches opponent filters
    if (!hasOpponentTeam && awayTeamInfo.id && awayTeamInfo.isOpponent) {
      hasOpponentTeam = filters.teams.opponentTeams.includes(awayTeamInfo.id);
    }

    // Check if explicit opponent matches filters
    if (!hasOpponentTeam && typeof opponentInfo.id === "string") {
      hasOpponentTeam = filters.teams.opponentTeams.includes(opponentInfo.id);
    }

    return hasTenantTeam && hasOpponentTeam;
  }

  // Helper: Extract team ID and opponent status
  function extractTeamInfo(
    team: any,
    defaultIsOpponent: boolean
  ): { id?: string; isOpponent: boolean } {
    if (!team) return { isOpponent: defaultIsOpponent };

    const isObject = typeof team === "object" && team !== null;
    const id = isObject ? String(team.id) : String(team);
    const isOpponent = isObject
      ? String(team.tenantId) !== tenantId
      : defaultIsOpponent;

    return { id, isOpponent };
  }

  // Helper: Extract opponent team ID
  function extractOpponentInfo(opponentTeam: any): { id?: string } {
    if (!opponentTeam) return {};

    const isObject = typeof opponentTeam === "object" && opponentTeam !== null;

    if (isObject) {
      const id =
        opponentTeam.id?.toString() || opponentTeam.opponentId?.toString();
      return { id };
    } else {
      return { id: String(opponentTeam) };
    }
  }

  // Event handlers
  const toggleEventType = (type: "games" | "trainings") => {
    setFilters((prev) => ({
      ...prev,
      eventTypes: { ...prev.eventTypes, [type]: !prev.eventTypes[type] },
    }));
  };

  const toggleTeam = (teamId: string, isOpponent: boolean) => {
    setFilters((prev) => {
      const teamType = isOpponent ? "opponentTeams" : "tenantTeams";
      const currentTeams = prev.teams[teamType];
      const newTeams = currentTeams.includes(teamId)
        ? currentTeams.filter((id) => id !== teamId)
        : [...currentTeams, teamId];

      return {
        ...prev,
        teams: { ...prev.teams, [teamType]: newTeams },
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      eventTypes: { games: true, trainings: true },
      teams: { tenantTeams: [], opponentTeams: [] },
    });
  };

  // Generate filter summary for display
  const getFilterSummary = (): string[] => {
    const summary = [];
    if (!filters.eventTypes.games) summary.push("No Games");
    if (!filters.eventTypes.trainings) summary.push("No Trainings");
    if (filters.teams.tenantTeams.length > 0) {
      summary.push(`${filters.teams.tenantTeams.length} Teams`);
    }
    if (filters.teams.opponentTeams.length > 0) {
      summary.push(`${filters.teams.opponentTeams.length} Opponents`);
    }
    return summary;
  };

  // Helper: Format team name for display
  const formatTeamName = (team: FilterTeam): string => {
    // First try to use the explicit name
    if (team.name && typeof team.name === "string" && team.name.trim() !== "") {
      return team.name;
    }

    // Build a team name from info if available
    const parts: string[] = [];

    // Format age (e.g., "U12#0-12" → "U12")
    if (team.age) {
      const ageParts = team.age.split("#");
      parts.push(ageParts[0]); // Take just the first part (U12)
    }

    // Format gender (e.g., "Male" → "Boys", "Female" → "Girls")
    if (team.gender) {
      if (team.gender.toLowerCase() === "male") {
        parts.push("Boys");
      } else if (team.gender.toLowerCase() === "female") {
        parts.push("Girls");
      } else {
        parts.push(team.gender);
      }
    }

    // Add skill level
    if (team.skill) {
      parts.push(team.skill);
    }

    if (parts.length > 0) {
      return parts.join(" • "); // Join with bullet separator
    }

    // Fallback to ID
    return `Team ${team.id}`;
  };

  // UI remains unchanged
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="filters"
      value={activeValue}
      onValueChange={setActiveValue}
    >
      <AccordionItem value="filters" className="border-b-0">
        <AccordionTrigger className="py-3 hover:no-underline">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2 text-primary" />
            <h3 className="text-base font-medium">Filters</h3>
            {activeFilterCount > 0 && (
              <p className="text-sm text-muted-foreground ml-2">
                {activeFilterCount}
              </p>
            )}
          </div>
        </AccordionTrigger>

        {/* Show filter chips when collapsed */}
        {activeValue !== "filters" && getFilterSummary().length > 0 && (
          <div className="px-4 py-2 border-t flex flex-wrap gap-2 overflow-hidden">
            {getFilterSummary().map((filter, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-accent/20 h-7 px-2 whitespace-nowrap"
              >
                {filter}
              </Badge>
            ))}
          </div>
        )}

        <AccordionContent className=" pt-2 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-muted-foreground">
              Filter events by type and teams
            </p>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs h-7"
              >
                Clear All
              </Button>
            )}
          </div>
          {/* Horizontal filter layout using a grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
            {/* Event Type Filter */}
            <Card className="shadow-sm border overflow-hidden">
              {/* Static header */}
              <div className="px-4 py-3 bg-accent/20 border-b">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Event Type</span>
                </div>
              </div>
              {/* Content */}
              <div className="px-4 pb-4 pt-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/10">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <Label htmlFor="filter-games" className="cursor-pointer">
                        Games
                      </Label>
                    </div>
                    <Switch
                      id="filter-games"
                      checked={filters.eventTypes.games}
                      onCheckedChange={() => toggleEventType("games")}
                      className="scale-75 origin-right"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/10">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-blue-500" />
                      <Label
                        htmlFor="filter-trainings"
                        className="cursor-pointer"
                      >
                        Trainings
                      </Label>
                    </div>
                    <Switch
                      id="filter-trainings"
                      checked={filters.eventTypes.trainings}
                      onCheckedChange={() => toggleEventType("trainings")}
                      className="scale-75 origin-right"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Tenant Teams Filter */}
            <Card className="shadow-sm border overflow-hidden">
              {/* Static header */}
              <div className="px-4 py-3 bg-accent/20 border-b">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="font-medium">
                    {tenantName || "Your teams"}
                  </span>
                  {filters.teams.tenantTeams.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1">
                      {filters.teams.tenantTeams.length}
                    </Badge>
                  )}
                </div>
              </div>
              {/* Content */}
              <div className="px-4 pb-4 pt-2">
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {tenantTeams.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No teams available
                    </p>
                  ) : (
                    tenantTeams.map((team) => (
                      <div
                        key={team.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md transition-colors",
                          filters.teams.tenantTeams.includes(team.id)
                            ? "bg-accent/60"
                            : "hover:bg-accent/30 cursor-pointer"
                        )}
                        onClick={() => toggleTeam(team.id, false)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: team.color || "#888888",
                            }}
                          />
                          <span className="text-sm">
                            {formatTeamName(team)}
                          </span>
                        </div>
                        {filters.teams.tenantTeams.includes(team.id) && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>

            {/* Opponent Teams Filter */}
            <Card className="shadow-sm border overflow-hidden">
              {/* Static header */}
              <div className="px-4 py-3 bg-accent/20 border-b">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Opponents</span>
                  {filters.teams.opponentTeams.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1">
                      {filters.teams.opponentTeams.length}
                    </Badge>
                  )}
                </div>
              </div>
              {/* Content */}
              <div className="px-4 pb-4 pt-2">
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {opponentTeams.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No opponent teams found in your events
                    </p>
                  ) : (
                    opponentTeams.map((team) => (
                      <div
                        key={team.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md transition-colors",
                          filters.teams.opponentTeams.includes(team.id)
                            ? "bg-accent/60"
                            : "hover:bg-accent/30 cursor-pointer"
                        )}
                        onClick={() => toggleTeam(team.id, true)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: team.color || "#888888",
                            }}
                          />
                          <span className="text-sm">
                            {formatTeamName(team)}
                          </span>
                        </div>
                        {filters.teams.opponentTeams.includes(team.id) && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
