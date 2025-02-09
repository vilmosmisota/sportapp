"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import { Opponent } from "@/entities/opponent/Opponent.schema";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { columns } from "./columns";
import { useState } from "react";
import { OpponentsTableToolbar } from "./OpponentsTableToolbar";

interface OpponentsDataTableProps {
  data: Opponent[];
  tenantId: string;
  canManage: boolean;
  tenant: Tenant;
}

export default function OpponentsDataTable({
  data,
  tenantId,
  canManage,
  tenant,
}: OpponentsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const tableColumns = columns({ tenantId, canManage, tenant });

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      columnPinning: {
        left: ["name"],
        right: ["actions"],
      },
    },
  });

  return (
    <div className="space-y-4">
      <OpponentsTableToolbar table={table} />
      <DataTable table={table} columns={tableColumns} data={data} />
    </div>
  );
}
