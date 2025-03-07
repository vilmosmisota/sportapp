"use client";

import * as React from "react";
import { useFilterContext } from "../FilterContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";

// Placeholder team data - in a real app, you'd fetch this from the API
const mockTeams = [
  { id: 1, name: "Lions FC", color: "blue" },
  { id: 2, name: "Tigers United", color: "orange" },
  { id: 3, name: "Eagles SC", color: "green" },
  { id: 4, name: "Panthers Athletic", color: "purple" },
  { id: 5, name: "Bears FC", color: "brown" },
];

export function TeamFilter() {
  const { filters, updateFilters } = useFilterContext();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleTeamToggle = (teamId: number, checked: boolean) => {
    const currentTeams = [...filters.teams.selectedTeams];

    if (checked) {
      // Add team to selection if not already selected
      if (!currentTeams.includes(teamId)) {
        updateFilters({
          teams: {
            selectedTeams: [...currentTeams, teamId],
          },
        });
      }
    } else {
      // Remove team from selection
      updateFilters({
        teams: {
          selectedTeams: currentTeams.filter((id) => id !== teamId),
        },
      });
    }
  };

  // Filter teams based on search query
  const filteredTeams = React.useMemo(() => {
    return mockTeams.filter((team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Teams</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Filter events by team.
      </p>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search teams..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Team list */}
      <div className="h-[200px] overflow-auto mt-2">
        <div className="space-y-2">
          {filteredTeams.map((team) => (
            <div key={team.id} className="flex items-center space-x-2">
              <Checkbox
                id={`team-${team.id}`}
                checked={filters.teams.selectedTeams.includes(team.id)}
                onCheckedChange={(checked) =>
                  handleTeamToggle(team.id, !!checked)
                }
              />
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-${team.color}-500`} />
                <Label
                  htmlFor={`team-${team.id}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {team.name}
                </Label>
              </div>
            </div>
          ))}

          {filteredTeams.length === 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No teams found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      </div>

      {/* Show selected count */}
      {filters.teams.selectedTeams.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {filters.teams.selectedTeams.length} team
          {filters.teams.selectedTeams.length > 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}
