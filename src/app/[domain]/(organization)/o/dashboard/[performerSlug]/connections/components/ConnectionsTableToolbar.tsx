"use client";

import { Button } from "@/components/ui/button";
import DataTableViewOptions from "@/components/ui/data-table/DataTableViewOptions";
import { Input } from "@/components/ui/input";
import { PerformerWithConnection } from "@/entities/member/PerformerConnection.schema";
import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

interface ConnectionsTableToolbarProps {
  table: Table<PerformerWithConnection>;
  tenantId: string;
  domain: string;
  displayName: string;
}

export function ConnectionsTableToolbar({
  table,
  tenantId,
  domain,
  displayName,
}: ConnectionsTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0;

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
