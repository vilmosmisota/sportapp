"use client";

import { useState, useMemo } from "react";
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

interface TeamsTableProps {
  teams?: Team[];
  tenantId: string;
  canManageTeams: boolean;
}

export default function TeamsTable({
  teams = [],
  tenantId,
  canManageTeams,
}: TeamsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { mutate: deleteTeam } = useDeleteTeam(tenantId);

  const handleDelete = (teamId: number) => {
    deleteTeam(teamId, {
      onSuccess: () => {
        toast.success("Team deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const memoizedColumns = useMemo(() => {
    return columns({
      onEdit: (team) => {
        setSelectedTeam(team);
        setIsEditOpen(true);
      },
      onDelete: handleDelete,
      canManageTeams,
    });
  }, [canManageTeams]);

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
      <div className="border rounded-lg overflow-hidden bg-white">
        <DataTable columns={memoizedColumns} data={teams} table={table} />
      </div>

      {selectedTeam && (
        <ResponsiveSheet
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          title="Edit Team"
        >
          <EditTeamForm
            team={selectedTeam}
            tenantId={tenantId}
            setIsParentModalOpen={setIsEditOpen}
          />
        </ResponsiveSheet>
      )}
    </div>
  );
}
