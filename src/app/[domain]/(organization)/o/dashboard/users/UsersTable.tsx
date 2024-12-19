import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { useDeleteUser } from "@/entities/user/User.actions.client";
import { User } from "@/entities/user/User.schema";

export function UsersTable({
  tenantId,
  users,
}: {
  tenantId: string;
  users: User[];
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { mutate: deleteUser } = useDeleteUser(tenantId);

  const handleConfirmDelete = (userId: string) => {
    deleteUser(userId, {
      onSuccess: () => {
        toast.success("User deleted successfully");
        setIsDeleteOpen(false);
      },
      onError: (error: Error) => {
        toast.error("Failed to delete user");
        console.error("Delete error:", error);
        setIsDeleteOpen(false);
      },
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="w-[50px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.entity?.adminRole}</TableCell>
            <TableCell>
              <Button
                onClick={() => {
                  setSelectedUser(user);
                  setIsDeleteOpen(true);
                }}
                variant="ghost"
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>

      {selectedUser && (
        <ConfirmDeleteDialog
          categoryId={selectedUser.id}
          isOpen={isDeleteOpen}
          setIsOpen={setIsDeleteOpen}
          text="This will permanently delete this user and remove their access. Are you sure you want to proceed? This action cannot be undone."
          onConfirm={handleConfirmDelete}
        />
      )}
    </Table>
  );
}
