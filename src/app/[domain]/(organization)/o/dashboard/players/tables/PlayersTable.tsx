"use client";

import { Player } from "@/entities/player/Player.schema";
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
import { useMemo, useState, useCallback, useEffect } from "react";
import { columns } from "./columns";
import { DataTablePagination } from "@/components/ui/data-table/DataTablePagination";
import { PlayersTableToolbar } from "./PlayersTableToolbar";
import { useDeletePlayer } from "@/entities/player/Player.actions.client";
import { toast } from "sonner";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ErrorBoundary } from "../../../../../../../components/ui/error-boundary";
import EditPlayerForm from "../forms/EditPlayerForm";
import ConnectedUsersDialog from "./ConnectedUsersDialog";

interface PlayersTableProps {
  players: Player[];
  tenantId: string;
  domain: string;
}

export default function PlayersTable({
  players,
  tenantId,
  domain,
}: PlayersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isConnectedUsersOpen, setIsConnectedUsersOpen] = useState(false);
  const deletePlayer = useDeletePlayer(tenantId);

  const handleEdit = useCallback((player: Player) => {
    setSelectedPlayer(player);
    setIsEditOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (playerId: number) => {
      try {
        await deletePlayer.mutateAsync(playerId);
        toast.success("Player deleted successfully");
      } catch (error) {
        toast.error("Failed to delete player");
      }
    },
    [deletePlayer]
  );

  const handleShowConnectedUsers = useCallback((player: Player) => {
    setSelectedPlayer(player);
    setIsConnectedUsersOpen(true);
  }, []);

  const tableColumns = useMemo(
    () =>
      columns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onShowConnectedUsers: handleShowConnectedUsers,
        domain,
      }),
    [domain, handleDelete, handleShowConnectedUsers, handleEdit]
  );

  const table = useReactTable({
    data: players,
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
        left: ["name"],
        right: ["actions"],
      },
    },
  });

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <PlayersTableToolbar
          table={table}
          tenantId={tenantId}
          domain={domain}
        />
        <DataTable
          table={table}
          columns={tableColumns}
          data={players}
          rowClassName="group/row"
        />
        <DataTablePagination table={table} />

        {selectedPlayer && (
          <>
            <ResponsiveSheet
              isOpen={isEditOpen}
              setIsOpen={setIsEditOpen}
              title="Edit Player"
            >
              <EditPlayerForm
                player={selectedPlayer}
                tenantId={tenantId}
                domain={domain}
                setIsParentModalOpen={setIsEditOpen}
              />
            </ResponsiveSheet>

            <ConnectedUsersDialog
              player={selectedPlayer}
              isOpen={isConnectedUsersOpen}
              setIsOpen={setIsConnectedUsersOpen}
            />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
