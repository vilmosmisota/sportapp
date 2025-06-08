import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { getGuardians, getGuardiansWithConnections } from "./Guardian.services";

export const useGuardians = (tenantId: string) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.member.byType(tenantId, "guardian"),
    queryFn: () => getGuardians(client, tenantId),
    enabled: !!tenantId,
  });
};

export const useGuardiansWithConnections = (tenantId: string) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.member.familyConnections(tenantId),
    queryFn: () => getGuardiansWithConnections(client, tenantId),
    enabled: !!tenantId,
  });
};
