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
import { useState } from "react";
import { columns } from "./columns";
import { DataTablePagination } from "@/components/ui/data-table/DataTablePagination";
import { PlayersTableToolbar } from "./PlayersTableToolbar";
import { useDeletePlayer } from "@/entities/player/Player.actions.client";
import { toast } from "sonner";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { DataTable } from "@/components/ui/data-table/DataTable";

interface PlayersTableProps {
  players: Player[];
  tenantId: string;
  domain: string;
  canManagePlayers: boolean;
}

export default function PlayersTable({
  players,
  tenantId,
  domain,
  canManagePlayers,
}: PlayersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const deletePlayer = useDeletePlayer(tenantId);

  const handleEdit = (player: Player) => {
    setSelectedPlayer(player);
    setIsEditOpen(true);
  };

  const handleDelete = async (playerId: number) => {
    try {
      await deletePlayer.mutateAsync(playerId);
      toast.success("Player deleted successfully");
    } catch (error) {
      toast.error("Failed to delete player");
    }
  };

  const table = useReactTable({
    data: players,
    columns: columns({
      onEdit: handleEdit,
      onDelete: handleDelete,
      canManagePlayers,
      domain,
      tenantId,
    }),
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
  });

  return (
    <div className="space-y-4">
      <PlayersTableToolbar table={table} tenantId={tenantId} />
      <DataTable
        table={table}
        columns={columns({
          onEdit: handleEdit,
          onDelete: handleDelete,
          canManagePlayers,
          domain,
          tenantId,
        })}
        data={players}
      />
      <DataTablePagination table={table} />

      {selectedPlayer && (
        <ResponsiveSheet
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          title="Edit Player"
        >
          {/* <EditPlayerForm
            player={selectedPlayer}
            tenantId={tenantId}
            domain={domain}
            setIsParentModalOpen={setIsEditOpen}
          /> */}
          <></>
        </ResponsiveSheet>
      )}
    </div>
  );
}
