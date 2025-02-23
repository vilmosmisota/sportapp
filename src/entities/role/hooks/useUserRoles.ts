import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { getUserRolesByTenant, toggleUserRolePrimary } from "../Role.services";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { UserRole } from "../Role.schema";

export const useUserRolesByTenant = (
  userId: string,
  tenantId: number,
  options?: Partial<UseQueryOptions<UserRole[]>>
) => {
  const client = useSupabase();

  return useQuery<UserRole[]>({
    queryKey: ["userRoles", userId, tenantId],
    queryFn: () => getUserRolesByTenant(client, userId, tenantId),
    ...options,
  });
};

export const useToggleUserRolePrimary = (userId: string, tenantId: number) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: number) =>
      toggleUserRolePrimary(client, roleId, tenantId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userRoles", userId, tenantId],
      });
    },
  });
};
