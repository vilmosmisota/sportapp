import {
  useSessionsByTenantAndSeason,
  useSessionsWithGroup,
} from "@/entities/session/Session.query";
import { SessionQueryParams } from "@/entities/session/Session.schema";
import {
  Tenant,
  TenantGroupsConfig,
} from "../../../entities/tenant/Tenant.schema";
import { SessionEventAdapter } from "../adapters/SessionEventAdapter";
import { CalendarEvent, DateRange } from "../types/calendar.types";
import { formatDate } from "../utils/date.utils";

/**
 * Hook for fetching event data for a specific group and converting to CalendarEvents
 * Currently uses sessions as the default event type, but can be extended for other event types
 */
export function useEventCalendarData(
  tenant: Tenant,
  groupId: number,
  seasonId: number,
  dateRange: DateRange
) {
  const queryParams: SessionQueryParams = {
    tenantId: tenant.id,
    groupId,
    seasonId,
    dateRange: {
      from: formatDate(dateRange.start),
      to: formatDate(dateRange.end),
    },
  };

  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSessionsWithGroup(queryParams);

  const adapter = new SessionEventAdapter();

  const events: CalendarEvent[] = sessions.map((session) =>
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
 * Hook for fetching events across all groups for a tenant and season
 */
export function useAllGroupsEventCalendarData(
  tenantId: number,
  seasonId: number,
  dateRange: DateRange,
  enabled: boolean = true,
  tenantGroupsConfig?: TenantGroupsConfig
) {
  const adapter = new SessionEventAdapter();

  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSessionsByTenantAndSeason(tenantId, seasonId, {
    from: formatDate(dateRange.start),
    to: formatDate(dateRange.end),
  });

  // Transform sessions to CalendarEvents
  const events: CalendarEvent[] = sessions.map((session) =>
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
