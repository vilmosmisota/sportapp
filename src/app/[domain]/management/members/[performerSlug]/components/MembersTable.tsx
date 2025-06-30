"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import { DataTablePagination } from "@/components/ui/data-table/DataTablePagination";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useDeletePerformer } from "@/entities/member/Performer.actions.client";
import { Performer } from "@/entities/member/Performer.schema";
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
import EditMemberForm from "./EditMemberForm";
import { MembersTableToolbar } from "./MembersTableToolbar";

interface MembersTableProps {
  members: Performer[];
  tenantId: string;
  domain: string;
  displayName: string;
}

export default function MembersTable({
  members,
  tenantId,
  domain,
  displayName,
}: MembersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "name",
      desc: false,
    },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Performer | null>(null);
  const deletePerformer = useDeletePerformer(tenantId);

  const handleEdit = useCallback((member: Performer) => {
    setSelectedMember(member);
    setIsEditOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (memberId: number) => {
      try {
        await deletePerformer.mutateAsync(memberId);
        toast.success(`${displayName.slice(0, -1)} deleted successfully`);
      } catch (error) {
        toast.error(
          `Failed to delete ${displayName.slice(0, -1).toLowerCase()}`
        );
      }
    },
    [deletePerformer, displayName]
  );

  const tableColumns = useMemo(
    () =>
      columns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        domain,
        displayName,
      }),
    [domain, handleDelete, handleEdit, displayName]
  );

  const table = useReactTable({
    data: members,
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
        left: ["actions", "name"],
      },
    },
  });

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <MembersTableToolbar
          table={table}
          tenantId={tenantId}
          domain={domain}
          displayName={displayName}
        />
        <DataTable
          table={table}
          columns={tableColumns}
          data={members}
          rowClassName="group/row"
        />
        <DataTablePagination table={table} />

        {selectedMember && (
          <ResponsiveSheet
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title={`Edit ${displayName.slice(0, -1)}`}
          >
            <EditMemberForm
              member={selectedMember}
              setIsParentModalOpen={setIsEditOpen}
            />
          </ResponsiveSheet>
        )}
      </div>
    </ErrorBoundary>
  );
}
