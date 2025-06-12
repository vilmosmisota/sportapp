import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { SessionQueryParams } from "./Session.schema";
import {
  getSessionById,
  getSessionsByGroup,
  getSessionsByTenant,
  getSessionsWithGroup,
} from "./Session.services";

export const useSessionsWithGroup = (params: SessionQueryParams) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.session.withGroup(
      params.tenantId.toString(),
      params.groupId,
      params.seasonId,
      params.dateRange
    ),
    queryFn: () => getSessionsWithGroup(client, params),
    enabled: !!params.tenantId && !!params.groupId && !!params.seasonId,
  });
};

export const useSessionsByGroup = (tenantId: string, groupId: number) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.session.byGroup(tenantId, groupId),
    queryFn: () => getSessionsByGroup(client, tenantId, groupId),
    enabled: !!tenantId && !!groupId,
  });
};

export const useSessionsByTenant = (tenantId: string) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.session.list(tenantId),
    queryFn: () => getSessionsByTenant(client, tenantId),
    enabled: !!tenantId,
  });
};

export const useSession = (tenantId: string, sessionId: number) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.session.detail(tenantId, sessionId.toString()),
    queryFn: () => getSessionById(client, tenantId, sessionId),
    enabled: !!tenantId && !!sessionId,
  });
};
