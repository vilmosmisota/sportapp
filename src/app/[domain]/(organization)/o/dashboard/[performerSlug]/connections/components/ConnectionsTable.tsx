"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import { DataTablePagination } from "@/components/ui/data-table/DataTablePagination";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { PerformerWithConnection } from "@/entities/member/PerformerConnection.schema";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Tenant } from "../../../../../../../../entities/tenant/Tenant.schema";
import { connectionsColumns } from "./connectionsColumns";
import { ConnectionsTableToolbar } from "./ConnectionsTableToolbar";
import ManageConnectionsForm from "./ManageConnectionsForm";

interface ConnectionsTableProps {
  performers: PerformerWithConnection[];
  tenant: Tenant;
  domain: string;
  displayName: string;
}

export default function ConnectionsTable({
  performers,
  tenant,
  domain,
  displayName,
}: ConnectionsTableProps) {
  const tenantId = tenant.id.toString();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedPerformer, setSelectedPerformer] =
    useState<PerformerWithConnection | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);

  const handleManageConnections = (performer: PerformerWithConnection) => {
    setSelectedPerformer(performer);
    setIsManageOpen(true);
  };

  const tableColumns = useMemo(
    () =>
      connectionsColumns({
        domain,
        displayName,
        tenantId,
        onManageConnections: handleManageConnections,
      }),
    [domain, displayName, tenantId]
  );

  const table = useReactTable({
    data: performers,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <ConnectionsTableToolbar
          table={table}
          tenantId={tenantId}
          domain={domain}
          displayName={displayName}
        />
        <DataTable
          table={table}
          columns={tableColumns}
          data={performers}
          rowClassName="group/row"
        />
        <DataTablePagination table={table} />

        {selectedPerformer && (
          <ResponsiveSheet
            isOpen={isManageOpen}
            setIsOpen={setIsManageOpen}
            title={`Manage Connections - ${selectedPerformer.firstName} ${selectedPerformer.lastName}`}
          >
            <ManageConnectionsForm
              performer={selectedPerformer}
              tenant={tenant}
              onClose={() => setIsManageOpen(false)}
            />
          </ResponsiveSheet>
        )}
      </div>
    </ErrorBoundary>
  );
}
