import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RoleForm } from "./Role.schema";
import {
  createRole,
  deleteRole,
  getRolesByTenant,
  updateRole,
} from "./Role.services";

export const useRolesByTenant = (tenantId: number) => {
  const client = useSupabase();
  const queryKey = [...queryKeys.role.list, tenantId];

  return useQuery({
    queryKey,
    queryFn: () => getRolesByTenant(client, tenantId),
  });
};

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
