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
import { Opponent, OpponentGroup } from "@/entities/opponent/Opponent.schema";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import OpponentForm from "./OpponentForm";
import { useDeleteOpponent } from "@/entities/opponent/Opponent.actions";
import { toast } from "sonner";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import {
  getDisplayAgeGroup,
  getDisplayGender,
} from "@/entities/team/Team.schema";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";

interface OpponentTableActionsProps {
  opponent: Opponent;
  tenantId: string;
  canManage: boolean;
  tenant: Tenant;
}

const OpponentTableActions = ({
  opponent,
  tenantId,
  canManage,
  tenant,
}: OpponentTableActionsProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteOpponent = useDeleteOpponent(tenantId);

  const handleDelete = (id: string) => {
    deleteOpponent.mutate(Number(id), {
      onSuccess: () => {
        toast.success("Opponent deleted successfully");
        setIsDeleteOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete opponent");
        setIsDeleteOpen(false);
      },
    });
  };

  if (!canManage) return null;

  return (
    <>
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
            onClick={() => setIsDeleteOpen(true)}
            className="cursor-pointer text-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
            tenant={tenant}
          />
        </div>
      </ResponsiveSheet>

      <ConfirmDeleteDialog
        categoryId={opponent.id}
        text={`Are you sure you want to delete ${opponent.name}? This action cannot be undone.`}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        onConfirm={handleDelete}
      />
    </>
  );
};

export const columns = ({
  tenantId,
  canManage,
  tenant,
}: {
  tenantId: string;
  canManage: boolean;
  tenant: Tenant;
}): ColumnDef<Opponent>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
    minSize: 200,
  },
  {
    accessorKey: "groups",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Groups" />
    ),
    cell: ({ row }) => {
      const groups = row.getValue("groups") as OpponentGroup[] | null;
      if (!groups?.length) return null;

      return (
        <div className="flex flex-wrap gap-2">
          {groups.map((group, index) => {
            const capitalizedGender =
              group.gender.charAt(0).toUpperCase() + group.gender.slice(1);
            return (
              <Badge
                key={index}
                variant="secondary"
                className="whitespace-nowrap"
              >
                {[
                  getDisplayAgeGroup(group.age),
                  getDisplayGender(capitalizedGender, group.age),
                  group.skill,
                ]
                  .filter(
                    (value): value is string =>
                      typeof value === "string" && value.length > 0
                  )
                  .join(" • ")}
              </Badge>
            );
          })}
        </div>
      );
    },
    enableSorting: false,
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
        tenant={tenant}
      />
    ),
    enableHiding: false,
    minSize: 100,
  },
];
