import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";

import { getMembershipCategories } from "./MembershipCategory.services";
import { useQuery } from "@tanstack/react-query";

export const useMembershipCategories = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.membershipCategory.all, queryKeys.season.all];

  const queryFn = async () => {
    const data = await getMembershipCategories(client, Number(tenantId));
    return data;
  };

  return useQuery({ queryKey, queryFn });
};
