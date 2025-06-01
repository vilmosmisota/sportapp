"use client";

import { PermissionDropdownMenu } from "@/components/auth/PermissionDropdownMenu";
import { MarsIcon, VenusIcon } from "@/components/icons/icons";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import { Group, Performer } from "@/entities/member/Performer.schema";
import { Permission } from "@/entities/role/Role.permissions";
import { ColumnDef } from "@tanstack/react-table";
import { differenceInYears } from "date-fns";
import { SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";

const GroupsCell = ({ member }: { member: Performer }) => {
  if (!member.groupConnections?.length) {
    return <div className="text-muted-foreground text-sm">No groups</div>;
  }

  const groups = member.groupConnections
    .map((c) => c.group)
    .filter((group): group is Group => group !== null);

  if (!groups.length) {
    return (
      <div className="text-muted-foreground text-sm">No active groups</div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {groups.map((group) => (
        <Badge key={group.id} variant="secondary" className="text-xs">
          {group.ageRange || `Group ${group.id}`}{" "}
          {group.gender && `(${group.gender})`}
        </Badge>
      ))}
    </div>
  );
};

interface MembersTableColumnsProps {
  onEdit: (member: Performer) => void;
  onDelete: (memberId: number) => void;
  domain: string;
  displayName: string;
}

interface MembersTableActionsProps {
  member: Performer;
  onEdit: (member: Performer) => void;
  onDelete: (memberId: number) => void;
  domain: string;
  displayName: string;
}

const MembersTableActions = ({
  member,
  onEdit,
  onDelete,
  domain,
  displayName,
}: MembersTableActionsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-center gap-2">
      <PermissionDropdownMenu
        actions={[
          {
            label: "Edit",
            onClick: () => onEdit(member),
            icon: <SquarePen className="h-4 w-4" />,
            permission: Permission.MANAGE_MEMBERS,
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
        categoryId={member.id}
        text={`Are you sure you want to delete ${member.firstName} ${member.lastName}? This action cannot be undone.`}
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
  displayName,
}: MembersTableColumnsProps): ColumnDef<Performer>[] => [
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <MembersTableActions
        member={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
        domain={domain}
        displayName={displayName}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const firstName = row.original.firstName;
      const lastName = row.original.lastName;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate font-medium">
            {firstName} {lastName}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
    minSize: 150,
    size: 200,
    maxSize: 300,
    filterFn: (row, id, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const firstName = (row.original.firstName || "").toLowerCase();
      const lastName = (row.original.lastName || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`.toLowerCase();

      return (
        fullName.includes(searchValue) ||
        firstName.includes(searchValue) ||
        lastName.includes(searchValue)
      );
    },
  },
  {
    accessorKey: "age",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Age" />
    ),
    cell: ({ row }) => {
      const dateOfBirth = row.original.dateOfBirth;
      if (!dateOfBirth) return <span className="text-muted-foreground">-</span>;

      try {
        const age = differenceInYears(new Date(), new Date(dateOfBirth));
        return <span>{age}</span>;
      } catch {
        return <span className="text-muted-foreground">-</span>;
      }
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.original.dateOfBirth;
      const dateB = rowB.original.dateOfBirth;

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return new Date(dateB).getTime() - new Date(dateA).getTime();
    },
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => {
      const gender = row.original.gender;
      if (!gender) return <span className="text-muted-foreground">-</span>;

      return (
        <div className="flex items-center gap-2">
          {gender === "Male" ? (
            <MarsIcon className="h-4 w-4 text-blue-500" />
          ) : gender === "Female" ? (
            <VenusIcon className="h-4 w-4 text-pink-500" />
          ) : null}
          <span>{gender}</span>
        </div>
      );
    },
    enableSorting: true,
    filterFn: (row, id, filterValue) => {
      const gender = row.original.gender || "";
      return gender.toLowerCase().includes(filterValue.toLowerCase());
    },
  },
  {
    accessorKey: "groups",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Groups" />
    ),
    cell: ({ row }) => <GroupsCell member={row.original} />,
    enableSorting: false,
  },
];
