"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import { DataTablePagination } from "@/components/ui/data-table/DataTablePagination";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useDeleteMember } from "@/entities/member/Member.actions.client";
import { MemberWithRelations } from "@/entities/member/Member.schema";
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
import { ErrorBoundary } from "../../../../../../../components/ui/error-boundary";
import { columns } from "./columns";
import ConnectedUsersDialog from "./ConnectedUsersDialog";
import EditMemberForm from "./EditMemberForm";
import { MembersTableToolbar } from "./MembersTableToolbar";

interface MembersTableProps {
  members: MemberWithRelations[];
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<MemberWithRelations | null>(null);
  const [isConnectedUsersOpen, setIsConnectedUsersOpen] = useState(false);
  const deleteMember = useDeleteMember(tenantId);

  const handleEdit = useCallback((member: MemberWithRelations) => {
    setSelectedMember(member);
    setIsEditOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (memberId: number) => {
      try {
        await deleteMember.mutateAsync(memberId);
        toast.success(`${displayName.slice(0, -1)} deleted successfully`);
      } catch (error) {
        toast.error(
          `Failed to delete ${displayName.slice(0, -1).toLowerCase()}`
        );
      }
    },
    [deleteMember, displayName]
  );

  const handleShowConnectedUsers = useCallback(
    (member: MemberWithRelations) => {
      setSelectedMember(member);
      setIsConnectedUsersOpen(true);
    },
    []
  );

  const tableColumns = useMemo(
    () =>
      columns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onShowConnectedUsers: handleShowConnectedUsers,
        domain,
        displayName,
      }),
    [domain, handleDelete, handleShowConnectedUsers, handleEdit, displayName]
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
          <>
            <ResponsiveSheet
              isOpen={isEditOpen}
              setIsOpen={setIsEditOpen}
              title={`Edit ${displayName.slice(0, -1)}`}
            >
              <EditMemberForm
                member={selectedMember}
                tenantId={tenantId}
                domain={domain}
                setIsParentModalOpen={setIsEditOpen}
                displayName={displayName}
              />
            </ResponsiveSheet>

            <ConnectedUsersDialog
              member={selectedMember}
              isOpen={isConnectedUsersOpen}
              setIsOpen={setIsConnectedUsersOpen}
              displayName={displayName}
            />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
