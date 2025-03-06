import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import {
  getGamesByTenantId,
  getGamesBySeason,
  getGamesByTeam,
  getGameById,
} from "./Game.services";

/**
 * Hook for fetching all games for a tenant
 */
export const useGamesByTenantId = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = queryKeys.game.byTenant(tenantId);

  const queryFn = async () => {
    return await getGamesByTenantId(client, tenantId);
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!tenantId,
  });
};

/**
 * Hook for fetching games for a specific season
 */
export const useGamesBySeason = (tenantId: string, seasonId: number) => {
  const client = useSupabase();
  const queryKey = queryKeys.game.bySeason(tenantId, seasonId);

  const queryFn = async () => {
    return await getGamesBySeason(client, tenantId, seasonId);
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!tenantId && !!seasonId,
  });
};

/**
 * Hook for fetching games for a specific team
 */
export const useGamesByTeam = (tenantId: string, teamId: number) => {
  const client = useSupabase();
  const queryKey = queryKeys.game.byTeam(tenantId, teamId);

  const queryFn = async () => {
    return await getGamesByTeam(client, tenantId, teamId);
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!tenantId && !!teamId,
  });
};

/**
 * Hook for fetching a single game by ID
 */
export const useGameById = (tenantId: string, gameId: number) => {
  const client = useSupabase();
  const queryKey = queryKeys.game.detail(tenantId, gameId);

  const queryFn = async () => {
    return await getGameById(client, tenantId, gameId);
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!tenantId && !!gameId,
  });
};
