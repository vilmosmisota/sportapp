import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import DataTableViewOptions from "@/components/ui/data-table/DataTableViewOptions";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OpponentsTableToolbarProps<TData> {
  table: Table<TData>;
}

export function OpponentsTableToolbar<TData>({
  table,
}: OpponentsTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="flex flex-1 items-center space-x-4">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            table.getColumn("name")?.setFilterValue(value);
          }}
          className="h-auto w-full md:w-[300px] bg-background"
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
