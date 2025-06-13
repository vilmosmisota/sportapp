import { useSessionsWithGroup } from "@/entities/session/Session.query";
import {
  SessionQueryParams,
  SessionWithGroup,
} from "@/entities/session/Session.schema";
import {
  Tenant,
  TenantGroupsConfig,
} from "../../../entities/tenant/Tenant.schema";
import { SessionEventAdapter } from "../adapters/SessionEventAdapter";
import { DateRange } from "../types/calendar.types";
import { SessionEvent } from "../types/event.types";
import { formatDate } from "../utils/date.utils";

/**
 * Hook for fetching session data for a specific group and converting to SessionEvents
 */
export function useSessionCalendarData(
  tenant: Tenant,
  groupId: number,
  seasonId: number,
  dateRange: DateRange,
  enabled: boolean = true
) {
  // Create query parameters with properly formatted dates
  const queryParams: SessionQueryParams = {
    tenantId: tenant.id,
    groupId,
    seasonId,
    dateRange: {
      from: formatDate(dateRange.start),
      to: formatDate(dateRange.end),
    },
  };

  // Use the existing query hook
  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSessionsWithGroup(queryParams);

  const adapter = new SessionEventAdapter();

  const events: SessionEvent[] = sessions.map((session) =>
    adapter.transform(session, tenant?.tenantConfigs?.groups || undefined)
  );

  return {
    events,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook for fetching sessions across all groups for a tenant and season
 * This would require a different query that fetches sessions for all groups
 */
export function useAllGroupsSessionCalendarData(
  tenantId: number,
  seasonId: number,
  dateRange: DateRange,
  enabled: boolean = true,
  tenantGroupsConfig?: TenantGroupsConfig
) {
  const adapter = new SessionEventAdapter();

  // Note: This would need a new query hook like useSessionsByTenantAndSeason
  // For now, I'll show the structure assuming such a hook exists

  // TODO: Create useSessionsByTenantAndSeason hook in Session.query.ts
  // const {
  //   data: sessions = [],
  //   isLoading,
  //   isError,
  //   error,
  //   refetch,
  // } = useSessionsByTenantAndSeason({
  //   tenantId,
  //   seasonId,
  //   dateRange: {
  //     from: formatDate(dateRange.start),
  //     to: formatDate(dateRange.end),
  //   },
  // });

  // Temporary implementation - this would need the actual query hook
  const sessions: SessionWithGroup[] = [];
  const isLoading = false;
  const isError = false;
  const error = null;
  const refetch = () => {};

  // Transform sessions to SessionEvents
  const events: SessionEvent[] = sessions.map((session) =>
    adapter.transform(session, tenantGroupsConfig)
  );

  return {
    events,
    isLoading,
    isError,
    error,
    refetch,
  };
}
