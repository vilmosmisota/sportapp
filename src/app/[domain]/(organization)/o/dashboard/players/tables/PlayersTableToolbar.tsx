"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import DataTableViewOptions from "@/components/ui/data-table/DataTableViewOptions";
import { MultiSelectFilters } from "@/components/ui/multi-select-filters";
import { PlayerGender } from "@/entities/player/Player.schema";
import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useTenantGroupTypes } from "@/entities/tenant/hooks/useGroupTypes";
import { Row } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlayersTableToolbarProps<TData> {
  table: Table<TData>;
  tenantId: string;
  domain: string;
}

export function PlayersTableToolbar<TData>({
  table,
  tenantId,
  domain,
}: PlayersTableToolbarProps<TData>) {
  const { data: teams } = useGetTeamsByTenantId(tenantId);
  const { positions } = useTenantGroupTypes(domain);
  const isFiltered = table.getState().columnFilters.length > 0;

  // Helper function to get filtered rows excluding a specific column
  const getFilteredRowsExcluding = (excludeColumn: string) => {
    const filters = table.getState().columnFilters;
    const tempFilters = filters.filter((f) => f.id !== excludeColumn);

    let rows = table.getPreFilteredRowModel().rows;
    for (const filter of tempFilters) {
      const column = table.getColumn(filter.id);
      if (column) {
        rows = rows.filter((row) => {
          const value = row.getValue(filter.id);
          if (filter.id === "teams") {
            const teamIds = value as string[];
            return (filter.value as string[]).some((id) =>
              teamIds.includes(id)
            );
          }
          return (filter.value as string[])?.includes(value as string);
        });
      }
    }
    return rows;
  };

  // Helper function to count available options for a column
  const getOptionsWithCounts = (
    columnId: string,
    filteredRows: Row<TData>[]
  ) => {
    const valueMap = new Map<string, number>();

    filteredRows.forEach((row) => {
      const value = row.getValue(columnId);
      if (columnId === "teams") {
        const teamIds = value as string[];
        teamIds.forEach((teamId) => {
          valueMap.set(teamId, (valueMap.get(teamId) || 0) + 1);
        });
      } else if (value) {
        valueMap.set(value as string, (valueMap.get(value as string) || 0) + 1);
      }
    });

    if (columnId === "teams") {
      // Get all unique team IDs from the current filtered rows
      const teamIds = new Set<string>();
      filteredRows.forEach((row) => {
        const rowTeams = row.getValue(columnId) as string[];
        if (Array.isArray(rowTeams)) {
          rowTeams.forEach((id) => teamIds.add(id));
        }
      });

      // Only show teams that exist in the current filtered data
      return (
        teams
          ?.filter((team) => teamIds.has(team.id.toString()))
          .map((team) => ({
            label: `${team.name || ""} (${team.age || ""} ${
              team.gender || ""
            } ${team.skill || ""})`.trim(),
            value: team.id.toString(),
            count: valueMap.get(team.id.toString()) || 0,
            disabled: !valueMap.has(team.id.toString()),
          })) || []
      );
    }

    const allValues = Array.from(
      new Set(
        table.getPreFilteredRowModel().rows.map((row) => row.getValue(columnId))
      )
    ) as string[];

    return allValues.map((value) => ({
      label: value,
      value,
      count: valueMap.get(value) || 0,
      disabled: !valueMap.has(value),
    }));
  };

  // Get filtered rows for each column
  const genderRows = getFilteredRowsExcluding("gender");
  const positionRows = getFilteredRowsExcluding("position");
  const teamRows = getFilteredRowsExcluding("teams");

  const filterGroups = [
    {
      title: "Gender",
      options: getOptionsWithCounts("gender", genderRows),
      selectedValues:
        (table.getColumn("gender")?.getFilterValue() as string[]) || [],
      onSelectionChange: (values: string[]) =>
        table
          .getColumn("gender")
          ?.setFilterValue(values.length ? values : undefined),
    },
    {
      title: "Position",
      options: getOptionsWithCounts("position", positionRows),
      selectedValues:
        (table.getColumn("position")?.getFilterValue() as string[]) || [],
      onSelectionChange: (values: string[]) =>
        table
          .getColumn("position")
          ?.setFilterValue(values.length ? values : undefined),
    },
  ];

  if (teams?.length) {
    filterGroups.push({
      title: "Teams",
      options: getOptionsWithCounts("teams", teamRows),
      selectedValues:
        (table.getColumn("teams")?.getFilterValue() as string[]) || [],
      onSelectionChange: (values: string[]) =>
        table
          .getColumn("teams")
          ?.setFilterValue(values.length ? values : undefined),
    });
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="flex flex-1 items-center space-x-4">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-auto w-full md:w-[300px] bg-background"
        />
        <MultiSelectFilters groups={filterGroups} />
      </div>
      <div className="flex items-center space-x-2">
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="px-2 lg:px-3 h-auto min-w-28"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
