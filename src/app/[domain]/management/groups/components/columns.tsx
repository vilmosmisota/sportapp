"use client";

import { MarsIcon, VenusIcon } from "@/components/icons/icons";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import { GroupBadge } from "@/components/ui/group-badge";
import { PermissionDropdownMenu } from "@/composites/auth/PermissionDropdownMenu";
import { Group } from "@/entities/group/Group.schema";
import { Permission } from "@/entities/role/Role.permissions";
import { TenantGroupsConfig } from "@/entities/tenant/Tenant.schema";
import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  formatAgeRange,
  formatGender,
} from "../../../../../entities/group/Group.utils";

interface GroupsTableColumnsProps {
  onEdit: (group: Group) => void;
  onDelete: (groupId: number) => void;
  domain: string;
  tenantGroupsConfig?: TenantGroupsConfig;
}

interface GroupsTableActionsProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDelete: (groupId: number) => void;
  domain: string;
}

const GroupsTableActions = ({
  group,
  onEdit,
  onDelete,
  domain,
}: GroupsTableActionsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-center gap-2">
      <PermissionDropdownMenu
        actions={[
          {
            label: "Edit",
            onClick: () => onEdit(group),
            icon: <SquarePen className="h-4 w-4" />,
            permission: Permission.MANAGE_MEMBERS, // Using existing permission
          },
          {
            label: "Delete",
            onClick: () => setIsDeleteDialogOpen(true),
            icon: <Trash2 className="h-4 w-4" />,
            permission: Permission.MANAGE_MEMBERS,
            variant: "destructive",
          },
        ]}
      />

      <ConfirmDeleteDialog
        categoryId={group.id}
        text={`Are you sure you want to delete the group "${group.ageRange}"? This action cannot be undone and will remove all member connections.`}
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={(id) => onDelete(Number(id))}
      />
    </div>
  );
};

export const columns = ({
  onEdit,
  onDelete,
  domain,
  tenantGroupsConfig,
}: GroupsTableColumnsProps): ColumnDef<Group>[] => [
  {
    id: "actions",
    cell: ({ row }) => (
      <GroupsTableActions
        group={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
        domain={domain}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "display",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Display" />
    ),
    cell: ({ row }) => (
      <GroupBadge
        group={row.original}
        tenantGroupsConfig={tenantGroupsConfig}
        showTooltip={true}
        size="sm"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    minSize: 150,
    size: 200,
    maxSize: 300,
  },
  {
    accessorKey: "ageRange",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Age" />
    ),
    cell: ({ row }) => {
      const ageRange = row.original.ageRange;
      const formattedRange = formatAgeRange(ageRange);
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{formattedRange}</span>
          {formattedRange !== ageRange && (
            <span className="text-xs text-muted-foreground">({ageRange})</span>
          )}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "level",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Level" />
    ),
    cell: ({ row }) => {
      const level = row.original.level;
      if (!level) return <span className="text-muted-foreground">-</span>;

      return (
        <Badge variant="outline" className="text-xs">
          {level}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => {
      const gender = row.original.gender;
      const ageRange = row.original.ageRange;
      if (!gender) return <span className="text-muted-foreground">-</span>;

      const formattedGender = formatGender(gender, ageRange);

      return (
        <div className="flex items-center gap-2">
          {gender.toLowerCase() === "male" ? (
            <MarsIcon className="h-4 w-4 text-blue-500" />
          ) : gender.toLowerCase() === "female" ? (
            <VenusIcon className="h-4 w-4 text-pink-500" />
          ) : gender.toLowerCase() === "mixed" ? (
            <div className="flex items-center gap-1">
              <MarsIcon className="h-4 w-4 text-blue-500" />
              <VenusIcon className="h-4 w-4 text-pink-500" />
            </div>
          ) : null}
          <span>{formattedGender}</span>
        </div>
      );
    },
    enableSorting: true,
    filterFn: (row, id, filterValue) => {
      const gender = row.original.gender || "";
      const ageRange = row.original.ageRange;
      const formattedGender = formatGender(gender, ageRange);
      return formattedGender.toLowerCase().includes(filterValue.toLowerCase());
    },
  },
];
