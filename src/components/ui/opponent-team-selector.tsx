"use client";

import React, { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Opponent } from "@/entities/opponent/Opponent.schema";
import { Team } from "@/entities/team/Team.schema";
import { Control, ControllerRenderProps, FieldValues } from "react-hook-form";
import {
  getDisplayGender,
  getDisplayAgeGroup,
} from "@/entities/team/Team.schema";
import { Badge } from "@/components/ui/badge";

interface OpponentTeamSelectorProps {
  opponents: Opponent[];
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function OpponentTeamSelector({
  opponents,
  control,
  name,
  label,
  placeholder = "Select opponent team",
  defaultValue,
  onChange,
  disabled = false,
}: OpponentTeamSelectorProps) {
  // Extract all teams directly (simpler approach)
  const flattenedTeams = useMemo(() => {
    const result: {
      id: number;
      name: string;
      displayName: string;
      opponentName: string;
      opponentColor: string;
      team: Team;
    }[] = [];

    if (!opponents || !Array.isArray(opponents)) {
      return result;
    }

    opponents.forEach((opponent) => {
      if (!opponent || !opponent.name) return;

      const opponentName = opponent.name;
      const opponentColor = opponent.appearance?.color || "";

      // Handle different data structure possibilities
      const teams = opponent.teams;

      if (teams && Array.isArray(teams)) {
        teams.forEach((team) => {
          if (team && typeof team === "object" && team.id) {
            // Format team information like in TeamBadge
            const details = [
              getDisplayAgeGroup(team.age),
              getDisplayGender(team.gender, team.age),
              team.skill,
            ]
              .filter(Boolean)
              .join(" • ");

            // Use name from team or generate a name if missing
            let teamName = "";

            if (team.name) {
              teamName = team.name;
            } else if (team.age || team.gender || team.skill) {
              // If no name but we have details, use opponent name
              teamName = opponentName;
            } else {
              // If no details at all, use opponent name + ID
              teamName = `${opponentName} Team #${team.id}`;
            }

            result.push({
              id: team.id,
              name: teamName,
              displayName: details || teamName,
              opponentName,
              opponentColor,
              team: team,
            });
          }
        });
      }
    });

    return result;
  }, [opponents]);

  // Group teams by opponent - this is a computed value, not state
  const groupedTeams = useMemo(() => {
    const grouped: Record<string, typeof flattenedTeams> = {};

    flattenedTeams.forEach((item) => {
      if (!grouped[item.opponentName]) {
        grouped[item.opponentName] = [];
      }
      grouped[item.opponentName].push(item);
    });

    return grouped;
  }, [flattenedTeams]);

  // Direct debug of the opponent data objects - computed value
  const opponentsDebugData = useMemo(() => {
    if (!opponents) return "opponents is undefined";
    if (!Array.isArray(opponents))
      return `opponents is not an array: ${typeof opponents}`;
    if (opponents.length === 0) return "opponents array is empty";

    return opponents
      .map((opp, i) => {
        const teamsInfo = opp.teams
          ? Array.isArray(opp.teams)
            ? `${opp.teams.length} teams`
            : `teams is not an array: ${typeof opp.teams}`
          : "no teams field";

        return `Opponent ${i}: ${opp.name || "unnamed"} (${teamsInfo})`;
      })
      .join("\n");
  }, [opponents]);

  return (
    <FormField
      control={control}
      name={name}
      render={({
        field,
      }: {
        field: ControllerRenderProps<FieldValues, string>;
      }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              if (onChange) onChange(value);
            }}
            defaultValue={defaultValue || field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {flattenedTeams.length > 0 ? (
                // Group by opponent organization
                Object.entries(groupedTeams).map(([opponentName, teams]) => (
                  <React.Fragment key={`org-${opponentName}`}>
                    {/* Opponent organization header */}
                    <div className="px-2 py-1.5 text-sm font-semibold flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: teams[0]?.opponentColor || "",
                        }}
                      />
                      <span>{opponentName}</span>
                    </div>

                    {/* Teams belonging to this opponent */}
                    {teams.map((item) => (
                      <SelectItem
                        key={`team-${item.id}`}
                        value={item.id.toString()}
                        className="pl-6 flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-sm">
                            {item.name}
                            {item.displayName &&
                              item.displayName !== item.name && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  {item.displayName}
                                </span>
                              )}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                // Fallback when no opponent teams found
                <div className="px-2 py-4 space-y-4">
                  {/* Visual representation of opponents data structure */}
                  <div>
                    <p className="text-sm text-center font-semibold mb-2">
                      Opponents Data Structure
                    </p>
                    <div className="text-xs border rounded p-2 max-h-32 overflow-auto bg-muted">
                      <pre>{opponentsDebugData}</pre>
                    </div>
                  </div>

                  {/* Status display */}
                  <div className="flex flex-col items-center">
                    <Badge variant="destructive" className="mb-2">
                      No Opponent Teams Found
                    </Badge>
                    <p className="text-xs text-center text-muted-foreground">
                      There are no opponent teams available. Make sure opponents
                      have been created with teams in the Opponents section.
                    </p>
                  </div>
                </div>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
