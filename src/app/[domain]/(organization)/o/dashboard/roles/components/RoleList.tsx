"use client";

import { Role, Domain } from "@/entities/role/Role.schema";
import { useDeleteRole } from "@/entities/role/Role.query";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { RoleItem } from "./RoleItem";

interface RoleListProps {
  roles: Role[];
  isLoading: boolean;
  domain: Domain;
}

export function RoleList({ roles, isLoading, domain }: RoleListProps) {
  const deleteRole = useDeleteRole();

  const handleDelete = async (roleId: string) => {
    try {
      await deleteRole.mutateAsync(roleId);
      toast.success("Role deleted successfully");
    } catch (error) {
      toast.error("Failed to delete role");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!roles.length) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          No {domain.toLowerCase()} roles found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <RoleItem key={role.id} role={role} onDelete={handleDelete} />
      ))}
    </div>
  );
}
