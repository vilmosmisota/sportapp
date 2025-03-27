import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/entities/user/User.schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import { RoleDomain, Permission } from "@/entities/role/Role.permissions";
import { SquarePen, Trash2 } from "lucide-react";
import { PermissionDropdownMenu } from "@/components/auth/PermissionDropdownMenu";

interface UsersTableActionsProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

function UsersTableActions({ user, onEdit, onDelete }: UsersTableActionsProps) {
  return (
    <PermissionDropdownMenu
      actions={[
        {
          label: "Edit",
          onClick: () => onEdit(user),
          icon: <SquarePen className="h-4 w-4" />,
          permission: Permission.MANAGE_USERS,
        },
        {
          label: "Delete",
          onClick: () => onDelete(user.id),
          icon: <Trash2 className="h-4 w-4" />,
          permission: Permission.MANAGE_USERS,
          variant: "destructive",
        },
      ]}
    />
  );
}

function getRoleBadgeVariant(domain: RoleDomain) {
  switch (domain) {
    case RoleDomain.MANAGEMENT:
      return "default";
    case RoleDomain.FAMILY:
      return "secondary";
    case RoleDomain.PLAYER:
      return "outline";
    default:
      return "default";
  }
}

export const columns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}): ColumnDef<User>[] => [
  {
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    id: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium lowercase">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </span>
          </div>
          <span className="font-medium capitalize">
            {user.firstName} {user.lastName}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: "includesString",
    minSize: 200,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => <div className="truncate">{row.original.email}</div>,
    enableSorting: true,
    enableHiding: true,
    minSize: 250,
  },
  {
    accessorFn: (row) => row.roles ?? [],
    id: "roles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Roles" />
    ),
    cell: ({ row }) => {
      const roles = row.original.roles ?? [];
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map(
            (userRole) =>
              userRole.role && (
                <Badge
                  key={userRole.id}
                  variant={getRoleBadgeVariant(userRole.role.domain)}
                  className="capitalize whitespace-nowrap"
                >
                  {userRole.role.name}
                </Badge>
              )
          )}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, filterValues) => {
      const userRoles = row.getValue(id) as User["roles"];
      return (
        !filterValues.length ||
        (userRoles ?? []).some((userRole) =>
          filterValues.includes(userRole.role?.domain)
        )
      );
    },
    minSize: 300,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <UsersTableActions
        user={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
    minSize: 100,
  },
];
