"use client";

import { Button } from "@/components/ui/button";
import DataTableViewOptions from "@/components/ui/data-table/DataTableViewOptions";
import { Input } from "@/components/ui/input";
import { MultiSelectFilters } from "@/components/ui/multi-select-filters";
import { Row, Table } from "@tanstack/react-table";
import { X } from "lucide-react";

interface MembersTableToolbarProps<TData> {
  table: Table<TData>;
  tenantId: string;
  domain: string;
  displayName: string;
}

export function MembersTableToolbar<TData>({
  table,
  tenantId,
  domain,
  displayName,
}: MembersTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  // Helper function to get filtered rows excluding a specific column
  const getFilteredRowsExcluding = (excludeColumn: string) => {
    // Check if the column exists before trying to filter
    if (!table.getColumn(excludeColumn)) {
      return table.getPreFilteredRowModel().rows;
    }

    const filters = table.getState().columnFilters;
    const tempFilters = filters.filter((f) => f.id !== excludeColumn);

    let rows = table.getPreFilteredRowModel().rows;
    for (const filter of tempFilters) {
      const column = table.getColumn(filter.id);
      if (column) {
        rows = rows.filter((row) => {
          const value = row.getValue(filter.id);
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
    // If the column doesn't exist, return an empty array
    if (!table.getColumn(columnId)) {
      return [];
    }

    const valueMap = new Map<string, number>();

    filteredRows.forEach((row) => {
      const value = row.getValue(columnId);
      if (value) {
        valueMap.set(value as string, (valueMap.get(value as string) || 0) + 1);
      }
    });

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

  // Build the filter groups
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
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="flex flex-1 items-center space-x-4">
        <Input
          placeholder={`Filter ${displayName.toLowerCase()} by name...`}
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            table.getColumn("name")?.setFilterValue(value);
          }}
          className="h-auto w-full md:w-[300px] bg-card"
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
