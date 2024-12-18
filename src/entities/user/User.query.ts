import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { getUserOnClient, getUsersByTenantId } from "./User.services";

// Query for getting the current authenticated user
export const useCurrentUser = () => {
  const client = useSupabase();
  const queryKey = [queryKeys.user.current];

  return useQuery({
    queryKey,
    queryFn: () => getUserOnClient(client),
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
