import { useSupabase } from "@/libs/supabase/useSupabase";
import { getTenantByDomain } from "./Tenant.services";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/cacheKeys/cacheKeys";

export const useTenantByDomain = (domain: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.tenant.all, queryKeys.tenant.detail(domain)];
  const queryFn = async () => {
    const data = await getTenantByDomain(domain, client);
    return data;
  };
  return useQuery({ queryKey, queryFn });
};
