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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteUser = useDeleteUser();

  const handleDelete = (userId: string) => {
    deleteUser.mutate(userId, {
      onSuccess: () => {
        toast.success("User deleted successfully");
        setIsDeleteOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete user");
        setIsDeleteOpen(false);
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
          <TableHeader className="bg-secondary">
            <TableRow>
              <TableHead className="text-left p-6">Name</TableHead>
              <TableHead className="text-left p-6">Email</TableHead>
              <TableHead className="text-left p-6">Roles</TableHead>
              {canManageUsers && (
                <TableHead className="text-right p-6">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="p-6 font-medium">
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell className="p-6">{user.email}</TableCell>
                <TableCell className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {user.entities?.map((entity) => (
                      <Badge
                        key={entity.id}
                        variant="secondary"
                        className="capitalize"
                      >
                        {entity.role.replace("-", " ")}
                      </Badge>
                    ))}
                  </div>
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
                        <DropdownMenuContent
                          align="end"
                          className="w-[160px] z-50"
                        >
                          <DropdownMenuItem className="group flex w-full items-center justify-between text-left p-0 text-sm font-medium text-neutral-700">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditOpen(true);
                              }}
                              className="w-full justify-start items-center gap-2 flex rounded-md p-2 transition-all duration-75 hover:bg-gray-100"
                            >
                              <SquarePen className="h-4 w-4" />
                              Edit
                            </button>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="group flex w-full items-center justify-between text-left p-0 text-sm font-medium text-neutral-700">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteOpen(true);
                              }}
                              className="w-full justify-start items-center gap-2 flex text-red-500 rounded-md p-2 transition-all duration-75 hover:bg-gray-100"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
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
