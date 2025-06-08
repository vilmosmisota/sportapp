"use client";

import { Button } from "@/components/ui/button";
import DataTableViewOptions from "@/components/ui/data-table/DataTableViewOptions";
import { Input } from "@/components/ui/input";
import { Group } from "@/entities/group/Group.schema";
import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

interface GroupsTableToolbarProps {
  table: Table<Group>;
  tenantId: string;
  domain: string;
}

export function GroupsTableToolbar({
  table,
  tenantId,
  domain,
}: GroupsTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter groups..."
          value={
            (table.getColumn("ageRange")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("ageRange")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
