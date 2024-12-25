"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTableViewOptions from "@/components/ui/data-table/DataTableViewOptions";
import { AgeLevel } from "@/entities/team/Team.schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamsTableToolbarProps<TData> {
  table: Table<TData>;
}

export default function TeamsTableToolbar<TData>({
  table,
}: TeamsTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  // Get unique age values from the data
  const uniqueAges = new Set(
    table.getPreFilteredRowModel().rows.map((row) => row.getValue("age"))
  );

  const uniqueGenders = new Set(
    table.getPreFilteredRowModel().rows.map((row) => row.getValue("gender"))
  );

  const uniqueSkills = new Set(
    table.getPreFilteredRowModel().rows.map((row) => row.getValue("skill"))
  );

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="flex flex-1 items-center space-x-4">
        <Input
          placeholder="Search coaches..."
          value={(table.getColumn("coach")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("coach")?.setFilterValue(event.target.value)
          }
          className="h-9 w-full md:w-[300px] bg-background"
        />
        <Select
          value={(table.getColumn("age")?.getFilterValue() as string) || "all"}
          onValueChange={(value) => {
            table
              .getColumn("age")
              ?.setFilterValue(value === "all" ? undefined : value);
          }}
        >
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Age Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Age Groups</SelectItem>
            {Array.from(uniqueAges).map((age) => (
              <SelectItem key={age as string} value={age as string}>
                {age as string}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={
            (table.getColumn("gender")?.getFilterValue() as string) || "all"
          }
          onValueChange={(value) => {
            table
              .getColumn("gender")
              ?.setFilterValue(value === "all" ? undefined : value);
          }}
        >
          <SelectTrigger
            className="h-9 w-[180px]
          "
          >
            <SelectValue placeholder="Gender Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Gender Groups</SelectItem>
            {Array.from(uniqueGenders).map((gender) => (
              <SelectItem key={gender as string} value={gender as string}>
                {gender as string}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={
            (table.getColumn("skill")?.getFilterValue() as string) || "all"
          }
          onValueChange={(value) => {
            table
              .getColumn("skill")
              ?.setFilterValue(value === "all" ? undefined : value);
          }}
        >
          <SelectTrigger
            className="h-9 w-[180px]
          "
          >
            <SelectValue placeholder="Skills Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Skills Groups</SelectItem>
            {Array.from(uniqueSkills).map((skill) => (
              <SelectItem key={skill as string} value={skill as string}>
                {skill as string}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className=" px-2 lg:px-3 h-auto"
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
