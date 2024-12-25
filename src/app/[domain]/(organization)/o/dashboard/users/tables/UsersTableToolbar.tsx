"use client";

import { Table, Row } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { User } from "@/entities/user/User.schema";
import DataTableViewOptions from "@/components/ui/data-table/DataTableViewOptions";
import { MultiSelectFilters } from "@/components/ui/multi-select-filters";

interface UsersTableToolbarProps {
  table: Table<User>;
}

export default function UsersTableToolbar({ table }: UsersTableToolbarProps) {
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
    filteredRows: Row<User>[]
  ) => {
    const valueMap = new Map<string, number>();

    filteredRows.forEach((row) => {
      const value = row.getValue(columnId) as string;
      if (value) {
        valueMap.set(value, (valueMap.get(value) || 0) + 1);
      }
    });

    const allValues = Array.from(
      new Set(
        table
          .getPreFilteredRowModel()
          .rows.map((row) => row.getValue(columnId))
          .filter(Boolean)
      )
    ) as string[];

    return allValues.map((value) => ({
      label: value.replace("-", " "),
      value: value,
      count: valueMap.get(value) || 0,
      disabled: !valueMap.has(value),
    }));
  };

  // Get filtered rows for each column
  const adminRoleRows = getFilteredRowsExcluding("adminRole");
  const domainRoleRows = getFilteredRowsExcluding("domainRole");

  const filterGroups = [
    {
      title: "Admin Role",
      options: getOptionsWithCounts("adminRole", adminRoleRows),
      selectedValues:
        (table.getColumn("adminRole")?.getFilterValue() as string[]) || [],
      onSelectionChange: (values: string[]) => {
        table
          .getColumn("adminRole")
          ?.setFilterValue(values.length ? values : undefined);
      },
    },
    {
      title: "Domain Role",
      options: getOptionsWithCounts("domainRole", domainRoleRows),
      selectedValues:
        (table.getColumn("domainRole")?.getFilterValue() as string[]) || [],
      onSelectionChange: (values: string[]) => {
        table
          .getColumn("domainRole")
          ?.setFilterValue(values.length ? values : undefined);
      },
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="flex flex-1 items-center space-x-4">
        <Input
          placeholder="Search by Name..."
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
