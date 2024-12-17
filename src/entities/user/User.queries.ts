import { getBrowserClient } from "@/libs/supabase/client";

import { useQuery } from "@tanstack/react-query";
import { checkTenantUserByIds, getUserOnClient } from "./User.services";
import { queryKeys } from "@/cacheKeys/cacheKeys";

export const useGetTenantUser = (tenantId: string | undefined) => {
  const queryKey = queryKeys.user.login(tenantId);
  const queryFn = async () => {
    const typedClient = getBrowserClient();
    const user = await getUserOnClient(typedClient);

    if (!user || !tenantId) {
      throw new Error("User not found");
    }

    const checkedTenantUser = await checkTenantUserByIds(
      typedClient,
      tenantId,
      user.id
    );

    if (!checkedTenantUser) {
      throw new Error("Tenant user not found");
    }

    return user;
  };

  return useQuery({ queryKey, queryFn, enabled: !!tenantId });
};
