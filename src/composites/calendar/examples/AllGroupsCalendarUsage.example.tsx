/**
 * Example usage of AllGroupsSessionCalendar
 * This shows how you would use the calendar to display sessions for all groups
 */

import {
  AllGroupsSessionCalendar,
  CalendarConfig,
  SessionEvent,
} from "@/composites/calendar";

// Example usage in a component
export function TenantSessionsPage() {
  const tenantId = 123;
  const seasonId = 456;

  const calendarConfig: CalendarConfig<SessionEvent> = {
    defaultView: "month",
    features: {
      navigation: true,
      viewSwitching: true,
      eventCreation: false,
      eventEditing: false,
      multiSelect: false,
    },
    styling: {
      theme: "light",
      compact: false,
    },
  };

  const handleEventClick = (event: SessionEvent) => {
    console.log("Session clicked:", event);
    // Show session details
    // Navigate to session page
    // Open session edit dialog
  };

  const handleDateClick = (date: Date) => {
    console.log("Date clicked:", date);
    // Show create session dialog for this date
    // Navigate to day view
  };

  return (
    <div className="h-[600px]">
      <AllGroupsSessionCalendar
        tenantId={tenantId}
        seasonId={seasonId}
        config={calendarConfig}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        className="h-full"
      />
    </div>
  );
}

/**
 * Required Query Hook Implementation
 *
 * You would need to add this to src/entities/session/Session.query.ts:
 */

/*
import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { SessionDateRange } from "./Session.schema";
import { getSessionsByTenantAndSeason } from "./Session.services";

interface SessionsByTenantAndSeasonParams {
  tenantId: number;
  seasonId: number;
  dateRange: SessionDateRange;
}

export const useSessionsByTenantAndSeason = (params: SessionsByTenantAndSeasonParams) => {
  const client = useSupabase();

  return useQuery({
    queryKey: queryKeys.session.byTenantAndSeason(
      params.tenantId.toString(),
      params.seasonId,
      params.dateRange
    ),
    queryFn: () => getSessionsByTenantAndSeason(client, params),
    enabled: !!params.tenantId && !!params.seasonId,
  });
};
*/

/**
 * Required Service Function Implementation
 *
 * You would need to add this to src/entities/session/Session.services.ts:
 */

/*
import { SupabaseClient } from "@supabase/supabase-js";
import { SessionWithGroup } from "./Session.schema";

interface SessionsByTenantAndSeasonParams {
  tenantId: number;
  seasonId: number;
  dateRange: {
    from: string;
    to: string;
  };
}

export async function getSessionsByTenantAndSeason(
  client: SupabaseClient,
  params: SessionsByTenantAndSeasonParams
): Promise<SessionWithGroup[]> {
  const { data, error } = await client
    .from('sessions')
    .select(`
      *,
      group:groups(*)
    `)
    .eq('tenantId', params.tenantId)
    .eq('seasonId', params.seasonId)
    .gte('date', params.dateRange.from)
    .lte('date', params.dateRange.to)
    .order('date', { ascending: true })
    .order('startTime', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch sessions: ${error.message}`);
  }

  return data || [];
}
*/

/**
 * Required Cache Key Addition
 *
 * You would need to add this to your cache keys:
 */

/*
// In cacheKeys/cacheKeys.ts
export const queryKeys = {
  session: {
    // ... existing keys
    byTenantAndSeason: (tenantId: string, seasonId: number, dateRange?: SessionDateRange) => [
      'sessions',
      'tenant',
      tenantId,
      'season',
      seasonId,
      dateRange,
    ] as const,
  },
  // ... other keys
};
*/
