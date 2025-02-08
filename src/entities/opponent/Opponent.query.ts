import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { getOpponentById, getOpponentsByTenantId } from "./Opponent.services";

// Query for getting all opponents for a tenant
export const useOpponents = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = queryKeys.opponent.all;

  return useQuery({
    queryKey,
    queryFn: () => getOpponentsByTenantId(client, tenantId),
    enabled: !!tenantId,
  });
};

// Query for getting a single opponent
export const useOpponent = (tenantId: string, opponentId: number) => {
  const client = useSupabase();
  const queryKey = queryKeys.opponent.detail(tenantId, String(opponentId));

  return useQuery({
    queryKey,
    queryFn: () => getOpponentById(client, opponentId, tenantId),
    enabled: !!tenantId && !!opponentId,
  });
};
