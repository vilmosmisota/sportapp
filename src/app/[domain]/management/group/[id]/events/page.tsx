"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { SeasonSelector } from "@/components/ui/season-selector";
import { PermissionButton } from "@/composites/auth/PermissionButton";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import {
  CalendarConfig,
  CalendarLoader,
  SessionCalendar,
  SessionEvent,
  seasonToCalendarSeason,
} from "@/composites/calendar";
import { createGroupDisplay } from "@/entities/group/Group.utils";
import { useGroupConnections } from "@/entities/group/GroupConnection.query";
import { Permission } from "@/entities/role/Role.permissions";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { Calendar, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface GroupEventsPageProps {
  params: {
    domain: string;
    id: string;
  };
}

export default function GroupEventsPage({ params }: GroupEventsPageProps) {
  const { tenant } = useTenantAndUserAccessContext();
  const tenantId = tenant?.id || 0;
  const groupId = parseInt(params.id);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");

  const {
    data: groupData,
    error,
    isLoading,
  } = useGroupConnections(
    tenantId.toString(),
    groupId,
    !!tenantId && !!groupId
  );

  const { data: seasons, isLoading: seasonsLoading } = useSeasonsByTenantId(
    tenantId.toString()
  );

  // Find the active season and preselect it
  const activeSeason = seasons?.find((season) => season.isActive);

  // Preselect the active season when seasons are loaded
  useEffect(() => {
    if (activeSeason && !selectedSeasonId) {
      setSelectedSeasonId(activeSeason.id.toString());
    }
  }, [activeSeason, selectedSeasonId]);

  // Find the selected season object
  const selectedSeason = seasons?.find(
    (season) => season.id.toString() === selectedSeasonId
  );

  // Convert season to calendar format
  const calendarSeason = useMemo(() => {
    if (!selectedSeason) return undefined;
    return seasonToCalendarSeason(selectedSeason);
  }, [selectedSeason]);

  // Calendar configuration
  const calendarConfig: CalendarConfig<SessionEvent> = useMemo(
    () => ({
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
    }),
    []
  );

  // Event handlers
  const handleEventClick = (event: SessionEvent) => {
    console.log("Session clicked:", event);
    // TODO: Open session details dialog or navigate to session page
  };

  const handleDateClick = (date: Date) => {
    console.log("Date clicked:", date);
    // TODO: Handle date click (maybe create new session)
  };

  const handleAddSession = () => {
    console.log("Add session clicked");
    // TODO: Open add session dialog or navigate to add session page
  };

  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="w-full space-y-6">
          <PageHeader
            title="Events"
            description="Loading group events..."
            actions={
              <div className="flex items-center gap-3">
                <div className="h-10 w-48 bg-muted animate-pulse rounded-md"></div>
                <div className="h-10 w-28 bg-muted animate-pulse rounded-md"></div>
              </div>
            }
          />
          <CalendarLoader />
        </div>
      </ErrorBoundary>
    );
  }

  if (error || !groupData) {
    return (
      <ErrorBoundary>
        <div className="w-full space-y-6">
          <PageHeader
            title="Events"
            description="Unable to load group events"
          />
        </div>
      </ErrorBoundary>
    );
  }

  const { group } = groupData;
  const groupDisplayName = createGroupDisplay(
    group,
    tenant?.tenantConfigs?.groups || undefined
  );

  // Create description with season info
  const getDescription = () => {
    if (selectedSeason) {
      const seasonName =
        selectedSeason.customName || `Season ${selectedSeason.id}`;
      return `Manage events and activities • ${seasonName}`;
    }
    return "Manage events and activities";
  };

  // Check if we have all required data for the calendar
  const canShowCalendar = tenantId && groupId && selectedSeasonId;

  return (
    <ErrorBoundary>
      <div className="w-full space-y-6">
        <PageHeader
          title="Events"
          description={getDescription()}
          actions={
            <div className="flex items-center gap-3">
              <SeasonSelector
                seasons={seasons}
                selectedSeason={selectedSeason}
                onSeasonChange={setSelectedSeasonId}
                isLoading={seasonsLoading}
                placeholder="Select season"
                className="min-w-[200px]"
              />
              <PermissionButton
                onClick={handleAddSession}
                permission={Permission.MANAGE_TRAINING}
                disabled={!selectedSeasonId}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Session
              </PermissionButton>
            </div>
          }
        />

        {canShowCalendar ? (
          <div className="border rounded-lg overflow-hidden">
            <SessionCalendar
              tenantId={tenantId}
              groupId={groupId}
              seasonId={parseInt(selectedSeasonId)}
              season={calendarSeason}
              config={calendarConfig}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              className="h-full border-0 rounded-none"
            />
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Session Calendar</h3>
            <p className="text-sm">
              {!selectedSeason
                ? "Please select a season to view sessions"
                : "Loading calendar..."}
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
