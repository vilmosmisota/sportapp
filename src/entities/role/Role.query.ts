import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { queryKeys } from "@/cacheKeys/cacheKeys";
import {
  getRolesByDomainAndTenantType,
  getUserDomainsWithRoles,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUserDomain,
  removeRoleFromUserDomain,
} from "./Role.services";
import { RoleForm } from "./Role.schema";

// Query hook for getting roles by domain and tenant type
export const useRolesByDomainAndTenantType = (
  domain: string,
  tenantType?: string
) => {
  const client = useSupabase();
  const queryKey = [...queryKeys.role.list, domain, tenantType];

  return useQuery({
    queryKey,
    queryFn: () => getRolesByDomainAndTenantType(client, domain, tenantType),
  });
};

// Query hook for getting user domains with roles
export const useUserDomainsWithRoles = (userId: string) => {
  const client = useSupabase();
  const queryKey = [...queryKeys.role.userDomains, userId];

  return useQuery({
    queryKey,
    queryFn: () => getUserDomainsWithRoles(client, userId),
    enabled: !!userId,
  });
};

// Mutation hook for creating a role
export const useCreateRole = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleData: RoleForm) => createRole(client, roleData),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [
          ...queryKeys.role.list,
          variables.domain,
          variables.tenantType,
        ],
      });
    },
  });
};

// Mutation hook for updating a role
export const useUpdateRole = (roleId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleData: Partial<RoleForm>) =>
      updateRole(client, roleId, roleData),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [
          ...queryKeys.role.list,
          variables.domain,
          variables.tenantType,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.role.userDomains,
      });
    },
  });
};

// Mutation hook for deleting a role
export const useDeleteRole = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => deleteRole(client, roleId),
    onSuccess: () => {
      // Invalidate all role-related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.role.list,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.role.userDomains,
      });
    },
  });
};

// Mutation hook for assigning a role to a user domain
export const useAssignRoleToUserDomain = (userId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userDomainId,
      roleId,
    }: {
      userDomainId: number;
      roleId: string;
    }) => assignRoleToUserDomain(client, userDomainId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.role.userDomains, userId],
      });
    },
  });
};

// Mutation hook for removing a role from a user domain
export const useRemoveRoleFromUserDomain = (userId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userDomainId,
      roleId,
    }: {
      userDomainId: number;
      roleId: string;
    }) => removeRoleFromUserDomain(client, userDomainId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.role.userDomains, userId],
      });
    },
  });
};
