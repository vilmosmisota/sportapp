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

      if (!user) {
        throw new Error("No user found");
      }

      const { data, error } = await client
        .from("users")
        .select(
          `
          *,
          entities:userEntities (
            id,
            createdAt,
            entityName,
            role,
            tenantId,
            clubId,
            divisionId,
            teamId
          )
        `
        )
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return UserSchema.parse(data);
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
