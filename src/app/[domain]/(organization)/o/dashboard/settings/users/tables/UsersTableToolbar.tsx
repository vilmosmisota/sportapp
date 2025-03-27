"use client";

import { Table, Row } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { User } from "@/entities/user/User.schema";
import DataTableViewOptions from "@/components/ui/data-table/DataTableViewOptions";
import { MultiSelectFilters } from "@/components/ui/multi-select-filters";
import { RoleDomain } from "@/entities/role/Role.permissions";

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
      const userRoles = row.getValue(columnId) as User["roles"];
      if (userRoles) {
        userRoles.forEach((userRole) => {
          if (userRole.role?.domain) {
            valueMap.set(
              userRole.role.domain,
              (valueMap.get(userRole.role.domain) || 0) + 1
            );
          }
        });
      }
    });

    return Object.values(RoleDomain).map((domain) => ({
      label: domain.charAt(0).toUpperCase() + domain.slice(1),
      value: domain,
      count: valueMap.get(domain) || 0,
      disabled: !valueMap.has(domain),
    }));
  };

  // Get filtered rows for roles
  const roleRows = getFilteredRowsExcluding("roles");

  const filterGroups = [
    {
      title: "Role Type",
      options: getOptionsWithCounts("roles", roleRows),
      selectedValues:
        (table.getColumn("roles")?.getFilterValue() as string[]) || [],
      onSelectionChange: (values: string[]) => {
        table
          .getColumn("roles")
          ?.setFilterValue(values.length ? values : undefined);
      },
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="flex flex-1 items-center space-x-4">
        <Input
          placeholder="Search by name..."
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
