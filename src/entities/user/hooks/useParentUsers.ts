import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { DomainRole } from "../User.schema";
import { getUsersByTenantId } from "../User.services";

export const useParentUsers = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.user.list, tenantId, "parents"];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const users = await getUsersByTenantId(client, tenantId);
      return users.filter(
        (user) => user.entity?.domainRole === DomainRole.PARENT
      );
    },
    enabled: !!tenantId,
  });
};
