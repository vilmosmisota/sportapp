"use client";

import { useState, useMemo, useCallback } from "react";
import {
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { User } from "@/entities/user/User.schema";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { useDeleteUser } from "@/entities/user/User.actions.client";
import { toast } from "sonner";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import EditUserForm from "../forms/EditUserForm";
import UsersTableToolbar from "./UsersTableToolbar";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";

interface UsersTableProps {
  users?: User[];
  tenantId: string;
}

export default function UsersTable({ users = [], tenantId }: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState<User | null>(
    null
  );

  const deleteUser = useDeleteUser(tenantId);

  const handleConfirmDelete = useCallback(() => {
    if (selectedUserToDelete) {
      deleteUser.mutate(selectedUserToDelete.id, {
        onSuccess: () => {
          toast.success("User deleted successfully");
          setIsDeleteOpen(false);
          setSelectedUserToDelete(null);
        },
        onError: (error: Error) => {
          toast.error(error.message);
          setIsDeleteOpen(false);
          setSelectedUserToDelete(null);
        },
      });
    }
  }, [deleteUser, selectedUserToDelete]);

  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  }, []);

  const handleDeleteUser = useCallback(
    (userId: string) => {
      const userToDelete = users.find((user) => user.id === userId);
      if (userToDelete) {
        setSelectedUserToDelete(userToDelete);
        setIsDeleteOpen(true);
      }
    },
    [users]
  );

  const memoizedColumns = useMemo(() => {
    return columns({
      onEdit: handleEditUser,
      onDelete: handleDeleteUser,
    });
  }, [handleEditUser, handleDeleteUser]);

  const table = useReactTable({
    data: users,
    columns: memoizedColumns,
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
    enableGlobalFilter: true,
  });

  return (
    <div className="space-y-4">
      <UsersTableToolbar table={table} />

      <DataTable columns={memoizedColumns} data={users} table={table} />

      {selectedUser && (
        <ResponsiveSheet
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          title="Edit User"
        >
          <EditUserForm
            user={selectedUser}
            tenantId={tenantId}
            setIsParentModalOpen={setIsEditOpen}
          />
        </ResponsiveSheet>
      )}

      {selectedUserToDelete && (
        <ConfirmDeleteDialog
          categoryId={selectedUserToDelete.id}
          isOpen={isDeleteOpen}
          setIsOpen={setIsDeleteOpen}
          text="This will permanently delete this user and remove their access. Are you sure you want to proceed? This action cannot be undone."
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
