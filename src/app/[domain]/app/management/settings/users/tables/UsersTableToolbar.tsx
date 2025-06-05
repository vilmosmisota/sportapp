"use client";

import { Button } from "@/components/ui/button";
import DataTableViewOptions from "@/components/ui/data-table/DataTableViewOptions";
import { Input } from "@/components/ui/input";
import { MultiSelectFilters } from "@/components/ui/multi-select-filters";
import { MemberType } from "@/entities/member/Member.schema";
import { UserMember } from "@/entities/user/User.schema";
import { Row, Table } from "@tanstack/react-table";
import { X } from "lucide-react";

interface UsersTableToolbarProps {
  table: Table<UserMember>;
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

  // Helper function to count available roles
  const getRoleOptionsWithCounts = (filteredRows: Row<UserMember>[]) => {
    const roleMap = new Map<string, number>();

    filteredRows.forEach((row) => {
      const role = row.getValue("role") as UserMember["role"];
      if (role) {
        roleMap.set(role.name, (roleMap.get(role.name) || 0) + 1);
      } else {
        roleMap.set("No Role", (roleMap.get("No Role") || 0) + 1);
      }
    });

    return Array.from(roleMap.entries()).map(([roleName, count]) => ({
      label: roleName,
      value: roleName,
      count,
      disabled: false,
    }));
  };

  // Helper function to count available member types
  const getMemberTypeOptionsWithCounts = (filteredRows: Row<UserMember>[]) => {
    const typeMap = new Map<string, number>();

    filteredRows.forEach((row) => {
      const member = row.getValue("memberType") as UserMember["member"];
      const memberType = member?.memberType;
      if (memberType) {
        typeMap.set(memberType, (typeMap.get(memberType) || 0) + 1);
      } else {
        typeMap.set("User Only", (typeMap.get("User Only") || 0) + 1);
      }
    });

    // Add all possible member types
    Object.values(MemberType).forEach((type) => {
      if (!typeMap.has(type)) {
        typeMap.set(type, 0);
      }
    });

    if (!typeMap.has("User Only")) {
      typeMap.set("User Only", 0);
    }

    return Array.from(typeMap.entries()).map(([typeName, count]) => ({
      label: typeName === "User Only" ? "User Only" : typeName,
      value: typeName,
      count,
      disabled: count === 0,
    }));
  };

  // Get filtered rows for each filter
  const roleRows = getFilteredRowsExcluding("role");
  const memberTypeRows = getFilteredRowsExcluding("memberType");

  const filterGroups = [
    {
      title: "Role",
      options: getRoleOptionsWithCounts(roleRows),
      selectedValues:
        (table.getColumn("role")?.getFilterValue() as string[]) || [],
      onSelectionChange: (values: string[]) => {
        table
          .getColumn("role")
          ?.setFilterValue(values.length ? values : undefined);
      },
    },
    {
      title: "Member Type",
      options: getMemberTypeOptionsWithCounts(memberTypeRows),
      selectedValues:
        (table.getColumn("memberType")?.getFilterValue() as string[]) || [],
      onSelectionChange: (values: string[]) => {
        table
          .getColumn("memberType")
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
