import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/entities/user/User.schema";
import { MoreVertical, SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteUser } from "@/entities/user/User.actions.client";
import { toast } from "sonner";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import EditUserForm from "../forms/EditUserForm";
import { Badge } from "@/components/ui/badge";

type UsersTableProps = {
  users?: User[];
  tenantId: string;
  canManageUsers: boolean;
};

export default function UsersTable({
  users,
  tenantId,
  canManageUsers,
}: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const deleteUser = useDeleteUser(tenantId);

  const handleDelete = (userId: string) => {
    deleteUser.mutate(userId, {
      onSuccess: () => {
        toast.success("User deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete user");
      },
    });
  };

  return (
    <>
      {selectedUser && (
        <ResponsiveSheet
          isOpen={isEditOpen && !isDropdownOpen}
          setIsOpen={setIsEditOpen}
          title="Edit User"
        >
          <EditUserForm
            user={selectedUser}
            tenantId={tenantId}
            setIsParentModalOpen={setIsEditOpen}
          />
        </ResponsiveSheet>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead className="text-left p-6">Name</TableHead>
              <TableHead className="text-left p-6">Email</TableHead>
              <TableHead className="text-left p-6">Admin Role</TableHead>
              <TableHead className="text-left p-6">Domain Role</TableHead>
              {canManageUsers && (
                <TableHead className="text-right p-6 w-[100px]">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="p-6 font-medium">
                  <div className="flex items-center gap-2 capitalize">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium lowercase">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </span>
                    </div>
                    {user.firstName} {user.lastName}
                  </div>
                </TableCell>
                <TableCell className="p-6">{user.email}</TableCell>
                <TableCell className="p-6">
                  {user.entity?.adminRole && (
                    <Badge variant="secondary" className="capitalize">
                      {user.entity.adminRole.replace("-", " ")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="p-6">
                  {user.entity?.domainRole && (
                    <Badge variant="secondary" className="capitalize">
                      {user.entity.domainRole.replace("-", " ")}
                    </Badge>
                  )}
                </TableCell>
                {canManageUsers && (
                  <TableCell className="text-right p-6">
                    <div className="flex items-center justify-end gap-2">
                      <DropdownMenu onOpenChange={setIsDropdownOpen}>
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
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <SquarePen className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(user.id)}
                            className="cursor-pointer text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
