"use client";

import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import { PermissionDropdownMenu } from "@/composites/auth/PermissionDropdownMenu";
import { Group } from "@/entities/group/Group.schema";
import { Permission } from "@/entities/role/Role.permissions";
import { TenantGroupsConfig } from "@/entities/tenant/Tenant.schema";
import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatAgeRange } from "../../../../../entities/group/Group.utils";

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

const DisplayCell = ({
  group,
  tenantGroupsConfig,
}: {
  group: Group;
  tenantGroupsConfig?: TenantGroupsConfig;
}) => {
  const color = group.appearance?.color;

  // Use global tenant config for display logic
  const useCustomName = tenantGroupsConfig?.useCustomName ?? false;
  const displayFields = tenantGroupsConfig?.defaultDisplayFields || [
    "ageRange",
  ];
  const displaySeparator = tenantGroupsConfig?.displaySeparator || "•";

  // Build display text from configured fields
  const displayParts = displayFields
    .map((field) => {
      switch (field) {
        case "ageRange":
          return formatAgeRange(group.ageRange);
        case "level":
          return group.level;
        case "gender":
          return group.gender;
        default:
          return null;
      }
    })
    .filter(Boolean);

  const displayText =
    displayParts.join(` ${displaySeparator} `) ||
    formatAgeRange(group.ageRange);

  return (
    <div className="flex items-center space-x-2">
      {color && (
        <div
          className="w-3 h-3 rounded-full border border-gray-200"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="font-medium">{displayText}</span>
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
      <DisplayCell
        group={row.original}
        tenantGroupsConfig={tenantGroupsConfig}
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
      if (!gender) return <span className="text-muted-foreground">-</span>;

      const getGenderColor = (gender: string) => {
        switch (gender.toLowerCase()) {
          case "male":
            return "bg-blue-100 text-blue-800 border-blue-200";
          case "female":
            return "bg-pink-100 text-pink-800 border-pink-200";
          case "mixed":
            return "bg-purple-100 text-purple-800 border-purple-200";
          default:
            return "bg-gray-100 text-gray-800 border-gray-200";
        }
      };

      return (
        <Badge
          variant="outline"
          className={`text-xs capitalize ${getGenderColor(gender)}`}
        >
          {gender}
        </Badge>
      );
    },
    enableSorting: true,
  },
];
