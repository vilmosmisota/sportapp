import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import {
  getTeamsByTenantId,
  getCoachesByTenantId,
  getTeamPlayers,
  getPlayersByTeamId,
} from "./Team.services";
import { useQuery } from "@tanstack/react-query";
import { useUsers } from "@/entities/user/User.query";

export const useGetTeamsByTenantId = (
  tenantId: string,
  includeOpponents: boolean = false
) => {
  const client = useSupabase();
  const { data: users } = useUsers(tenantId);
  const queryKey = [queryKeys.team.all, tenantId, includeOpponents];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const data = await getTeamsByTenantId(client, tenantId, {
        includeOpponents,
      });

      // Map coaches to teams using the cached users data
      return data.map((team) => ({
        ...team,
        coach: team.coachId
          ? users?.find((user) => user.id === team.coachId) ?? null
          : null,
      }));
    },
    enabled: !!tenantId && !!users,
  });
};

// New function to get teams by opponent ID
export const useGetTeamsByOpponentId = (
  tenantId: string,
  opponentId: number
) => {
  const client = useSupabase();
  const queryKey = queryKeys.team.byOpponent(tenantId, opponentId);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await client
        .from("teams")
        .select("*")
        .eq("tenantId", tenantId)
        .eq("opponentId", opponentId);

      if (error) throw new Error(error.message);

      return data;
    },
    enabled: !!tenantId && !!opponentId,
  });
};

export const useGetCoachesByTenantId = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.team.coaches, tenantId];

  return useQuery({
    queryKey,
    queryFn: () => getCoachesByTenantId(client, tenantId),
    enabled: !!tenantId,
  });
};

export const useTeamPlayers = (teamId: number, tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.team.players(tenantId, teamId)];

  return useQuery({
    queryKey,
    queryFn: () => getTeamPlayers(client, teamId, tenantId),
    enabled: !!teamId && !!tenantId,
  });
};

export const usePlayersByTeamId = (teamId: number, tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.team.players(tenantId, teamId)];

  return useQuery({
    queryKey,
    queryFn: () => getPlayersByTeamId(client, teamId, tenantId),
    enabled: !!teamId && !!tenantId,
  });
};
