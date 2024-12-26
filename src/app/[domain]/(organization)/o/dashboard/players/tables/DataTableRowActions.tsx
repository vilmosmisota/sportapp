"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Player } from "@/entities/player/Player.schema";
import { useDeletePlayer } from "@/entities/player/Player.actions.client";
import { toast } from "sonner";
// import EditPlayerForm from "../forms/EditPlayerForm";

interface DataTableRowActionsProps {
  row: Row<Player>;
  tenantId: string;
  domain: string;
  canManagePlayers: boolean;
}

export function DataTableRowActions({
  row,
  tenantId,
  domain,
  canManagePlayers,
}: DataTableRowActionsProps) {
  const player = row.original;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deletePlayer = useDeletePlayer(tenantId);

  const handleDelete = async () => {
    try {
      await deletePlayer.mutateAsync(player.id);
      toast.success("Player deleted successfully");
    } catch (error) {
      toast.error("Failed to delete player");
    }
  };

  if (!canManagePlayers) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Player"
      >
        {/* <EditPlayerForm
          player={player}
          tenantId={tenantId}
          domain={domain}
          setIsParentModalOpen={setIsEditOpen}
        /> */}

        <></>
      </ResponsiveSheet>
    </>
  );
}
