import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import {
  getGamesByTenantId,
  getGamesBySeason,
  getGamesByTeam,
  getGameById,
  getGamesByDateRange,
} from "./Game.services";
import { format } from "date-fns";
import type { Game } from "./Game.schema";

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

export const useGamesFromMonthQuery = (
  tenantId: string,
  startDate: Date,
  endDate: Date,
  seasonId: number,
  enabled = true
) => {
  const client = useSupabase();

  // Format dates for cache keys
  const formattedStart = format(startDate, "yyyy-MM-dd");
  const formattedEnd = format(endDate, "yyyy-MM-dd");

  // Create query key
  const queryKey = queryKeys.game.byDateRange(
    tenantId,
    formattedStart,
    formattedEnd,
    seasonId
  );

  return useQuery<Game[]>({
    queryKey,
    queryFn: async () =>
      getGamesByDateRange(client, tenantId, startDate, endDate, seasonId),
    enabled: enabled && !!tenantId && !!seasonId,
  });
};
