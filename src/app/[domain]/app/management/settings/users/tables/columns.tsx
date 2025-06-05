import { Badge } from "@/components/ui/badge";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import { PermissionDropdownMenu } from "@/composites/auth/PermissionDropdownMenu";
import { Permission } from "@/entities/role/Role.permissions";
import { UserMember } from "@/entities/user/User.schema";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { GraduationCap, SquarePen, Trash2 } from "lucide-react";

interface UsersTableActionsProps {
  user: UserMember;
  onEdit: (user: UserMember) => void;
  onDelete: (userId: string) => void;
}

function UsersTableActions({ user, onEdit, onDelete }: UsersTableActionsProps) {
  return (
    <div className="flex items-center justify-end">
      <PermissionDropdownMenu
        actions={[
          {
            label: "Edit",
            onClick: () => onEdit(user),
            icon: <SquarePen className="h-4 w-4" />,
            permission: Permission.MANAGE_SETTINGS_USERS,
          },
          {
            label: "Delete",
            onClick: () => onDelete(user.id),
            icon: <Trash2 className="h-4 w-4" />,
            permission: Permission.MANAGE_SETTINGS_USERS,
            variant: "destructive",
          },
        ]}
      />
    </div>
  );
}

export const columns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (user: UserMember) => void;
  onDelete: (userId: string) => void;
}): ColumnDef<UserMember>[] => [
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => (
      <UsersTableActions
        user={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
    minSize: 80,
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorFn: (row) => {
      if (row.member) {
        return `${row.member.firstName} ${row.member.lastName}`;
      }
      return row.email || "No name";
    },
    id: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      const firstName = user.member?.firstName;
      const lastName = user.member?.lastName;
      const displayName =
        firstName && lastName
          ? `${firstName} ${lastName}`
          : user.email || "No name";

      const initials =
        firstName && lastName
          ? `${firstName[0]}${lastName[0]}`
          : user.email?.[0]?.toUpperCase() || "?";

      return (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium">{initials}</span>
          </div>
          <span className="font-medium truncate">{displayName}</span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: "includesString",
    minSize: 180,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="truncate max-w-[200px]">{row.original.email}</div>
    ),
    enableSorting: true,
    enableHiding: true,
    minSize: 200,
  },
  {
    accessorFn: (row) => row.role,
    id: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.original.role;
      if (!role) {
        return <Badge variant="outline">No Role</Badge>;
      }

      return (
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="whitespace-nowrap text-xs">
            {role.name}
          </Badge>
          {role.isInstructor && (
            <Badge
              variant="secondary"
              className="text-xs bg-purple-50 text-purple-700"
            >
              <GraduationCap className="h-3 w-3" />
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, filterValues) => {
      const role = row.getValue(id) as UserMember["role"];
      return !filterValues.length || (role && filterValues.includes(role.name));
    },
    minSize: 160,
  },
  {
    accessorFn: (row) => row.member?.memberType,
    id: "memberType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const memberType = row.original.member?.memberType;
      if (!memberType) {
        return (
          <Badge variant="outline" className="text-xs">
            User Only
          </Badge>
        );
      }

      return (
        <Badge
          variant="default"
          className="capitalize text-xs whitespace-nowrap"
        >
          {memberType}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, filterValues) => {
      const memberType = row.original.member?.memberType;
      const value = memberType || "User Only";
      return !filterValues.length || filterValues.includes(value);
    },
    minSize: 100,
  },
  {
    accessorFn: (row) => row.member?.createdAt,
    id: "created",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const createdAt = row.original.member?.createdAt;
      if (!createdAt) {
        return <span className="text-muted-foreground text-xs">Unknown</span>;
      }

      try {
        const date = new Date(createdAt);
        return (
          <div className="flex flex-col">
            <span className="text-xs font-medium">
              {format(date, "MMM d, yyyy")}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(date, "HH:mm")}
            </span>
          </div>
        );
      } catch (error) {
        return (
          <span className="text-muted-foreground text-xs">Invalid date</span>
        );
      }
    },
    enableSorting: true,
    enableHiding: true,
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.original.member?.createdAt;
      const dateB = rowB.original.member?.createdAt;

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return new Date(dateA).getTime() - new Date(dateB).getTime();
    },
    minSize: 120,
  },
];
