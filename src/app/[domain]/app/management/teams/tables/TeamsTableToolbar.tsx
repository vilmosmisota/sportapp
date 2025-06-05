"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTableViewOptions from "@/components/ui/data-table/DataTableViewOptions";
import { MultiSelectFilters } from "@/components/ui/multi-select-filters";
import { Row } from "@tanstack/react-table";

interface TeamsTableToolbarProps<TData> {
  table: Table<TData>;
}

export default function TeamsTableToolbar<TData>({
  table,
}: TeamsTableToolbarProps<TData>) {
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
      const value = row.getValue(columnId) as string;
      valueMap.set(value, (valueMap.get(value) || 0) + 1);
    });

    const allValues = Array.from(
      new Set(
        table.getPreFilteredRowModel().rows.map((row) => row.getValue(columnId))
      )
    ) as string[];

    return allValues.map((value) => ({
      label: value,
      value: value,
      count: valueMap.get(value) || 0,
      disabled: !valueMap.has(value),
    }));
  };

  // Get filtered rows for each column
  const ageRows = getFilteredRowsExcluding("age");
  const genderRows = getFilteredRowsExcluding("gender");
  const skillRows = getFilteredRowsExcluding("skill");

  const filterGroups = [
    {
      title: "Age Groups",
      options: getOptionsWithCounts("age", ageRows),
      selectedValues:
        (table.getColumn("age")?.getFilterValue() as string[]) || [],
      onSelectionChange: (values: string[]) => {
        table
          .getColumn("age")
          ?.setFilterValue(values.length ? values : undefined);
      },
    },
    {
      title: "Gender",
      options: getOptionsWithCounts("gender", genderRows),
      selectedValues:
        (table.getColumn("gender")?.getFilterValue() as string[]) || [],
      onSelectionChange: (values: string[]) => {
        table
          .getColumn("gender")
          ?.setFilterValue(values.length ? values : undefined);
      },
    },
    {
      title: "Skill Level",
      options: getOptionsWithCounts("skill", skillRows),
      selectedValues:
        (table.getColumn("skill")?.getFilterValue() as string[]) || [],
      onSelectionChange: (values: string[]) => {
        table
          .getColumn("skill")
          ?.setFilterValue(values.length ? values : undefined);
      },
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="flex flex-1 items-center space-x-4">
        <Input
          placeholder="Search by Coach..."
          value={(table.getColumn("coach")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("coach")?.setFilterValue(event.target.value)
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
            className="px-2 lg:px-3 h-auto min-w-28 "
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
