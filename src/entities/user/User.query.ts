import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { getUserOnClient, getUsersByTenantId } from "./User.services";
import { UserSchema } from "@/entities/user/User.schema";

// Query for getting the current authenticated user
export const useCurrentUser = () => {
  const client = useSupabase();
  const queryKey = queryKeys.user.current;

  return useQuery({
    queryKey,
    queryFn: async () => {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!user) return null;

      const { data, error } = await client
        .from("users")
        .select(
          `
          *,
          entity:userEntities!inner (
            id,
            createdAt,
            adminRole,
            domainRole,
            tenantId,
            clubId,
            divisionId,
            teamId
          )
        `
        )
        .eq("id", user.id)
        .single();

      if (error || !data) return null;

      const entity = Array.isArray(data.entity) ? data.entity[0] : data.entity;

      return UserSchema.parse({
        ...data,
        entity: entity || null,
      });
    },
  });
};

// Query for getting all users in a tenant
export const useUsers = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.user.list, tenantId];

  return useQuery({
    queryKey,
    queryFn: () => getUsersByTenantId(client, tenantId),
    enabled: !!tenantId,
  });
};
