import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { queryKeys } from "@/cacheKeys/cacheKeys";
import {
  getRolesByTenant,
  getUserRoles,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
} from "./Role.services";
import { RoleForm } from "./Role.schema";

// Query hook for getting all roles for a tenant (including global roles)
export const useRolesByTenant = (tenantId?: number) => {
  const client = useSupabase();
  const queryKey = [...queryKeys.role.list, tenantId];

  return useQuery({
    queryKey,
    queryFn: () => getRolesByTenant(client, tenantId),
    enabled: !!tenantId,
  });
};

// Query hook for getting user roles
export const useUserRoles = (userId: string) => {
  const client = useSupabase();
  const queryKey = [...queryKeys.role.userRoles, userId];

  return useQuery({
    queryKey,
    queryFn: () => getUserRoles(client, userId),
  });
};

// Mutation hook for creating a role
export const useCreateRole = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleData: RoleForm) => createRole(client, roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.role.list });
    },
  });
};

// Mutation hook for updating a role
export const useUpdateRole = (roleId: number) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleData: Partial<RoleForm>) =>
      updateRole(client, roleId, roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.role.list });
    },
  });
};

// Mutation hook for deleting a role
export const useDeleteRole = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: number) => deleteRole(client, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.role.list });
    },
  });
};

// Mutation hook for assigning a role to a user
export const useAssignRoleToUser = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      roleId,
      tenantId,
    }: {
      userId: string;
      roleId: number;
      tenantId: number;
    }) => assignRoleToUser(client, userId, roleId, tenantId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.role.userRoles, userId],
      });
    },
  });
};

// Mutation hook for removing a role from a user
export const useRemoveRoleFromUser = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      roleId,
      tenantId,
    }: {
      userId: string;
      roleId: number;
      tenantId: number;
    }) => removeRoleFromUser(client, userId, roleId, tenantId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.role.userRoles, userId],
      });
    },
  });
};
