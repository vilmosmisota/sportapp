import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "../../../libs/supabase/useSupabase";
import { queryKeys } from "../../../cacheKeys/cacheKeys";
import { getUsersByTenantId } from "../User.services";
import { DomainRole } from "../User.schema";

export const usePlayerUsers = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.user.list, tenantId, "players"];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const users = await getUsersByTenantId(client, tenantId);
      return users.filter(
        (user) => user.entity?.domainRole === DomainRole.PLAYER
      );
    },
    enabled: !!tenantId,
  });
};
