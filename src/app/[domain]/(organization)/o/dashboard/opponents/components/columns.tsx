import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2, Mail, Phone } from "lucide-react";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import { Opponent } from "@/entities/opponent/Opponent.schema";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useDeleteOpponent } from "@/entities/opponent/Opponent.actions";
import { toast } from "sonner";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import {
  getDisplayAgeGroup,
  getDisplayGender,
} from "@/entities/group/Group.schema";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { PermissionDropdownMenu } from "@/components/auth/PermissionDropdownMenu";
import { Permission } from "@/entities/role/Role.permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditOpponentForm } from "../form";

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
          <EditOpponentForm
            opponentId={opponent.id ?? 0}
            tenantId={tenantId}
            setIsOpen={setIsEditOpen}
            tenant={tenant}
          />
        </div>
      </ResponsiveSheet>

      <ConfirmDeleteDialog
        categoryId={opponent.id || 0}
        text="This will permanently delete this opponent. Are you sure you want to proceed?"
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
      const opponent = row.original;
      const teamColor = opponent.appearance?.color;

      return (
        <div className="flex items-center space-x-3">
          {teamColor && (
            <div
              className="w-4 h-4 rounded-full border border-border flex-shrink-0"
              style={{ backgroundColor: teamColor }}
            />
          )}
          <span className="font-medium">{opponent.name}</span>
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
      if (!teams?.length)
        return <span className="text-muted-foreground text-sm">No teams</span>;

      return (
        <div className="flex flex-wrap gap-2 max-w-[350px]">
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
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => {
      const location = row.original.location;
      if (
        !location ||
        (!location.name && !location.city && !location.streetAddress)
      ) {
        return (
          <span className="text-muted-foreground text-sm">No location</span>
        );
      }

      return (
        <div className="flex flex-col text-sm max-w-[250px]">
          {location.name && (
            <span className="font-medium">{location.name}</span>
          )}
          <div className="text-muted-foreground">
            {[location.streetAddress, location.city, location.postcode]
              .filter(Boolean)
              .join(", ")}
          </div>
          {location.mapLink && (
            <a
              href={location.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-xs hover:underline mt-1"
            >
              View on map
            </a>
          )}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
    minSize: 220,
  },
  {
    accessorKey: "contact",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact Info" />
    ),
    cell: ({ row }) => {
      const opponent = row.original;
      const hasContactInfo = opponent.contactEmail || opponent.contactPhone;

      if (!hasContactInfo) {
        return (
          <span className="text-muted-foreground text-sm">No contact info</span>
        );
      }

      return (
        <div className="flex flex-col text-sm space-y-1">
          {opponent.contactEmail && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <a
                href={`mailto:${opponent.contactEmail}`}
                className="hover:underline text-primary"
              >
                {opponent.contactEmail}
              </a>
            </div>
          )}
          {opponent.contactPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <a
                href={`tel:${opponent.contactPhone}`}
                className="hover:underline text-primary"
              >
                {opponent.contactPhone}
              </a>
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
    minSize: 200,
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => {
      const notes = row.original.notes;
      if (!notes) return null;

      return (
        <div className="max-w-[200px]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm text-muted-foreground line-clamp-2 cursor-help">
                  {notes}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">{notes}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    enableSorting: false,
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
    minSize: 80,
  },
];
