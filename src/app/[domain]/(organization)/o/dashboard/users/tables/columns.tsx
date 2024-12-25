import { ColumnDef, Row } from "@tanstack/react-table";
import { User } from "@/entities/user/User.schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, SquarePen, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DataTableColumnHeader from "@/components/ui/data-table/DataTableColumnHeader";
import { cn } from "@/libs/tailwind/utils";

interface UsersTableActionsProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  canManageUsers: boolean;
}

const UsersTableActions = ({
  user,
  onEdit,
  onDelete,
  canManageUsers,
}: UsersTableActionsProps) => {
  if (!canManageUsers) return null;

  return (
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
            onClick={() => onEdit(user)}
            className="cursor-pointer"
          >
            <SquarePen className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(user.id)}
            className="cursor-pointer text-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const columns = ({
  onEdit,
  onDelete,
  canManageUsers,
}: {
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  canManageUsers: boolean;
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
    accessorFn: (row) => row.entity?.adminRole,
    id: "adminRole",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Admin Role" />
    ),
    cell: ({ row }) => {
      const role = row.original.entity?.adminRole;
      return role ? (
        <Badge variant="secondary" className="capitalize whitespace-nowrap">
          {role.replace("-", " ")}
        </Badge>
      ) : null;
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, filterValues) => {
      const value = row.getValue(id) as string;
      return !filterValues.length || filterValues.includes(value);
    },
    minSize: 130,
  },
  {
    accessorFn: (row) => row.entity?.domainRole,
    id: "domainRole",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Domain Role" />
    ),
    cell: ({ row }) => {
      const role = row.original.entity?.domainRole;
      return role ? (
        <Badge variant="secondary" className="capitalize whitespace-nowrap">
          {role.replace("-", " ")}
        </Badge>
      ) : null;
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, filterValues) => {
      const value = row.getValue(id) as string;
      return !filterValues.length || filterValues.includes(value);
    },
    minSize: 130,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <UsersTableActions
        user={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
        canManageUsers={canManageUsers}
      />
    ),
    minSize: 100,
  },
];
