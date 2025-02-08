"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import { Opponent } from "@/entities/opponent/Opponent.schema";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { columns } from "./columns";

interface OpponentsDataTableProps {
  data: Opponent[];
  tenantId: string;
  canManage: boolean;
}

export function OpponentsDataTable({
  data,
  tenantId,
  canManage,
}: OpponentsDataTableProps) {
  const tableColumns = columns({ tenantId, canManage });

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return <DataTable table={table} columns={tableColumns} data={data} />;
}
