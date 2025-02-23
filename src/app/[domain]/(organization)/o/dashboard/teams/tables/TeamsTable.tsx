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
import { Team } from "@/entities/team/Team.schema";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { useDeleteTeam } from "@/entities/team/Team.actions.client";
import { toast } from "sonner";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import EditTeamForm from "../forms/EditTeamForm";
import TeamsTableToolbar from "./TeamsTableToolbar";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";

interface TeamsTableProps {
  teams?: Team[];
  tenantId: string;
  domain: string;
}

export default function TeamsTable({
  teams = [],
  tenantId,
  domain,
}: TeamsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "age", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeamToDelete, setSelectedTeamToDelete] = useState<Team | null>(
    null
  );

  const deleteTeam = useDeleteTeam(tenantId);

  const handleConfirmDelete = useCallback(() => {
    if (selectedTeamToDelete) {
      deleteTeam.mutate(selectedTeamToDelete.id, {
        onSuccess: () => {
          toast.success("Team deleted successfully");
          setIsDeleteOpen(false);
          setSelectedTeamToDelete(null);
        },
        onError: (error: Error) => {
          toast.error(error.message);
          setIsDeleteOpen(false);
          setSelectedTeamToDelete(null);
        },
      });
    }
  }, [deleteTeam, selectedTeamToDelete]);

  const handleEditTeam = useCallback((team: Team) => {
    setSelectedTeam(team);
    setIsEditOpen(true);
  }, []);

  const handleDeleteTeam = useCallback(
    (teamId: number) => {
      const teamToDelete = teams.find((team) => team.id === teamId);
      if (teamToDelete) {
        setSelectedTeamToDelete(teamToDelete);
        setIsDeleteOpen(true);
      }
    },
    [teams]
  );

  const memoizedColumns = useMemo(() => {
    return columns({
      onEdit: handleEditTeam,
      onDelete: handleDeleteTeam,

      domain,
    });
  }, [handleEditTeam, handleDeleteTeam, domain]);

  const table = useReactTable({
    data: teams,
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
      <TeamsTableToolbar table={table} />

      <DataTable
        columns={memoizedColumns}
        data={teams}
        table={table}
        rowClassName="group/row"
      />

      {selectedTeam && (
        <ResponsiveSheet
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          title="Edit Team"
        >
          <EditTeamForm
            team={selectedTeam}
            tenantId={tenantId}
            domain={domain}
            setIsParentModalOpen={setIsEditOpen}
          />
        </ResponsiveSheet>
      )}

      {selectedTeamToDelete && (
        <ConfirmDeleteDialog
          categoryId={selectedTeamToDelete.id}
          isOpen={isDeleteOpen}
          setIsOpen={setIsDeleteOpen}
          text="This will permanently delete this team and remove its access. Are you sure you want to proceed? This action cannot be undone."
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
