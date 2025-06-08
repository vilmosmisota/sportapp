"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import { DataTablePagination } from "@/components/ui/data-table/DataTablePagination";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useDeleteGroup } from "@/entities/group/Group.actions.client";
import { Group } from "@/entities/group/Group.schema";
import { TenantGroupsConfig } from "@/entities/tenant/Tenant.schema";
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
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { columns } from "./columns";
import EditGroupForm from "./forms/EditGroupForm";
import { GroupsTableToolbar } from "./GroupsTableToolbar";

interface GroupsTableProps {
  groups: Group[];
  tenantId: string;
  domain: string;
  tenantGroupsConfig?: TenantGroupsConfig;
}

export default function GroupsTable({
  groups,
  tenantId,
  domain,
  tenantGroupsConfig,
}: GroupsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const deleteGroup = useDeleteGroup(tenantId);

  const handleEdit = useCallback((group: Group) => {
    setSelectedGroup(group);
    setIsEditOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (groupId: number) => {
      try {
        await deleteGroup.mutateAsync(groupId);
        toast.success("Group deleted successfully");
      } catch (error) {
        toast.error("Failed to delete group");
      }
    },
    [deleteGroup]
  );

  const tableColumns = useMemo(
    () =>
      columns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        domain,
        tenantGroupsConfig,
      }),
    [domain, handleDelete, handleEdit, tenantGroupsConfig]
  );

  const table = useReactTable({
    data: groups,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableColumnPinning: true,
    initialState: {
      columnPinning: {
        left: ["actions", "display"],
      },
    },
  });

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <GroupsTableToolbar table={table} tenantId={tenantId} domain={domain} />
        <DataTable
          table={table}
          columns={tableColumns}
          data={groups}
          rowClassName="group/row"
        />
        <DataTablePagination table={table} />

        {selectedGroup && (
          <ResponsiveSheet
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title="Edit Group"
          >
            <EditGroupForm
              group={selectedGroup}
              tenantId={tenantId}
              setIsParentModalOpen={setIsEditOpen}
            />
          </ResponsiveSheet>
        )}
      </div>
    </ErrorBoundary>
  );
}
