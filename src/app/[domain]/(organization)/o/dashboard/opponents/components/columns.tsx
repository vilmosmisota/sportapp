import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, SquarePen, Trash2 } from "lucide-react";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import { Opponent } from "@/entities/opponent/Opponent.schema";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import OpponentForm from "./OpponentForm";
import { useDeleteOpponent } from "@/entities/opponent/Opponent.actions";
import { toast } from "sonner";

interface OpponentTableActionsProps {
  opponent: Opponent;
  tenantId: string;
  canManage: boolean;
}

const OpponentTableActions = ({
  opponent,
  tenantId,
  canManage,
}: OpponentTableActionsProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteOpponent = useDeleteOpponent(tenantId);

  const handleDelete = async () => {
    try {
      await deleteOpponent.mutateAsync(opponent.id);
      toast.success("Opponent deleted successfully");
    } catch (error) {
      toast.error("Failed to delete opponent");
    }
  };

  if (!canManage) return null;

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 data-[state=open]:bg-gray-100"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem
              onClick={() => setIsEditOpen(true)}
              className="cursor-pointer"
            >
              <SquarePen className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer text-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Opponent"
      >
        <div className="p-4">
          <OpponentForm
            opponent={opponent}
            tenantId={tenantId}
            setIsOpen={setIsEditOpen}
          />
        </div>
      </ResponsiveSheet>
    </>
  );
};

export const columns = ({
  tenantId,
  canManage,
}: {
  tenantId: string;
  canManage: boolean;
}): ColumnDef<Opponent>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    enableSorting: true,
    enableHiding: true,
    minSize: 200,
  },
  {
    accessorKey: "location.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    enableSorting: true,
    enableHiding: true,
    minSize: 200,
  },
  {
    accessorKey: "location.city",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    enableSorting: true,
    enableHiding: true,
    minSize: 150,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <OpponentTableActions
        opponent={row.original}
        tenantId={tenantId}
        canManage={canManage}
      />
    ),
    minSize: 100,
  },
];
