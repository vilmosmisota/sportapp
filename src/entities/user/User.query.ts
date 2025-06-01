import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, getUsersByTenantId } from "./User.services";

export const useCurrentUser = () => {
  const client = useSupabase();
  const queryKey = queryKeys.user.current;

  return useQuery({
    queryKey,
    queryFn: () => getCurrentUser(client),
  });
};

export const useUsers = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.user.list, tenantId];

  return useQuery({
    queryKey,
    queryFn: () => getUsersByTenantId(client, tenantId),
    enabled: !!tenantId,
  });
};
