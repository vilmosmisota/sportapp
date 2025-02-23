import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import { Opponent } from "@/entities/opponent/Opponent.schema";
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
import { PermissionDropdownMenu } from "@/components/auth/PermissionDropdownMenu";
import { Permission } from "@/entities/role/Role.permissions";

interface OpponentTableActionsProps {
  opponent: Opponent;
  tenantId: string;
  tenant: Tenant;
}

const OpponentTableActions = ({
  opponent,
  tenantId,
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

  const actions = [
    {
      label: "Edit",
      onClick: () => setIsEditOpen(true),
      icon: <SquarePen className="h-4 w-4" />,
      permission: Permission.MANAGE_TEAM,
    },
    {
      label: "Delete",
      onClick: () => setIsDeleteOpen(true),
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive" as const,
      permission: Permission.MANAGE_TEAM,
    },
  ];

  return (
    <>
      <PermissionDropdownMenu actions={actions} />

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
  tenant,
}: {
  tenantId: string;
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
    accessorKey: "teams",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teams" />
    ),
    cell: ({ row }) => {
      const teams = row.getValue("teams") as any[] | null;
      if (!teams?.length) return null;

      return (
        <div className="flex flex-wrap gap-2">
          {teams.map((team, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="whitespace-nowrap"
            >
              {[
                getDisplayAgeGroup(team.age),
                getDisplayGender(team.gender, team.age),
                team.skill,
              ]
                .filter(
                  (value): value is string =>
                    typeof value === "string" && value.length > 0
                )
                .join(" • ")}
            </Badge>
          ))}
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
        tenant={tenant}
      />
    ),
    enableHiding: false,
    minSize: 100,
  },
];
