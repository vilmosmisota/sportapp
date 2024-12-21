import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { getTeamsByTenantId, getCoachesByTenantId } from "./Team.services";
import { useQuery } from "@tanstack/react-query";
import { useUsers } from "@/entities/user/User.query";

export const useGetTeamsByTenantId = (tenantId: string) => {
  const client = useSupabase();
  const { data: users } = useUsers(tenantId);
  const queryKey = [queryKeys.team.all];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const data = await getTeamsByTenantId(client, tenantId);

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

export const useGetCoachesByTenantId = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.team.coaches, tenantId];

  return useQuery({
    queryKey,
    queryFn: () => getCoachesByTenantId(client, tenantId),
    enabled: !!tenantId,
  });
};
