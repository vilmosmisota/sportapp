"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { SeasonSelector } from "@/components/ui/season-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionButton } from "@/composites/auth/PermissionButton";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import {
  AllGroupsEventCalendar,
  CalendarConfig,
  CalendarEvent,
  EventDialogProvider,
  seasonToCalendarSeason,
} from "@/composites/calendar";
import { useGroups } from "@/entities/group/Group.query";
import { Permission } from "@/entities/role/Role.permissions";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { Session } from "@/entities/session/Session.schema";
import { CalendarDays, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AddSessionForm, EditSessionForm } from "./components/forms";

interface CalendarPageProps {
  params: {
    domain: string;
  };
}

function CalendarPageSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="h-10 w-48 bg-muted animate-pulse rounded-md"></div>
      </div>
      <div className="w-full h-[600px] rounded-lg border">
        <Skeleton className="w-full h-full" />
      </div>
    </div>
  );
}

export default function CalendarPage({ params }: CalendarPageProps) {
  const { tenant } = useTenantAndUserAccessContext();
  const tenantId = tenant?.id;
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [isAddSessionSheetOpen, setIsAddSessionSheetOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Get seasons for the tenant
  const {
    data: seasons = [],
    isLoading: seasonsLoading,
    error: seasonsError,
  } = useSeasonsByTenantId(tenantId?.toString() || "");

  // Get groups for the tenant
  const { data: groups = [], isLoading: groupsLoading } = useGroups(
    tenantId?.toString() || ""
  );

  // Auto-select active season on load
  const activeSeason = seasons?.find((season) => season.isActive);

  useEffect(() => {
    if (activeSeason && !selectedSeasonId) {
      setSelectedSeasonId(activeSeason.id.toString());
    }
  }, [activeSeason, selectedSeasonId]);

  // Get the currently selected season
  const selectedSeason = seasons?.find(
    (season) => season.id.toString() === selectedSeasonId
  );

  // Convert season to calendar season format (includes breaks)
  const calendarSeason = useMemo(() => {
    if (!selectedSeason) return undefined;
    return seasonToCalendarSeason(selectedSeason);
  }, [selectedSeason]);

  // Calendar configuration
  const calendarConfig: CalendarConfig<CalendarEvent> = {
    defaultView: "month",
    features: {
      navigation: true,
      eventCreation: true,
      eventEditing: true,
      multiSelect: false,
      viewSwitching: true,
    },
    styling: {
      theme: "auto",
      compact: false,
    },
  };

  // Event handlers
  const handleEventClick = (event: CalendarEvent) => {
    // Single click opens event details dialog (handled by EventDialogProvider)
    console.log("Event clicked:", event);
  };

  const handleEventDoubleClick = (event: CalendarEvent) => {
    // Double click opens edit form
    handleEditEvent(event);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddSession = (date: Date) => {
    setIsEditMode(false);
    setSelectedSession(null);
    setSelectedDate(date);
    setIsAddSessionSheetOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    // Extract the session data from the event
    if (event.type === "session" && event.data) {
      const session = event.data as Session;
      console.log("Edit session:", session);
      setIsEditMode(true);
      setSelectedSession(session);
      setIsAddSessionSheetOpen(true);
    }
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    if (event.type === "session" && event.data) {
      const session = event.data as Session;
      console.log("Delete session:", session);
      // Delete is handled by the EventDetailsDialog
    }
  };

  // Dynamic description based on selected season
  const getDescription = () => {
    if (selectedSeason) {
      const seasonName =
        selectedSeason.customName || `Season ${selectedSeason.id}`;
      return `View and manage all events across your organization • ${seasonName}`;
    }
    return "View and manage all events across your organization";
  };

  // Get training locations from tenant config
  const locations = tenant?.tenantConfigs?.development?.trainingLocations || [];

  if (seasonsLoading || groupsLoading) {
    return <CalendarPageSkeleton />;
  }

  if (!tenant || !tenantId) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center space-y-2">
        <CalendarDays className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">Organization not found</h3>
        <p className="text-sm text-muted-foreground">
          The organization you&apos;re looking for does not exist.
        </p>
      </div>
    );
  }

  if (seasonsError) {
    return (
      <div className="w-full space-y-6">
        <PageHeader
          title="Calendar"
          description="View and manage all events across your organization."
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
                onClick={() => {
                  setSelectedDate(new Date());
                  setIsAddSessionSheetOpen(true);
                }}
                permission={Permission.MANAGE_EVENTS}
                disabled={!selectedSeasonId}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Session
              </PermissionButton>
            </div>
          }
        />
        <div className="w-full h-48 flex flex-col items-center justify-center space-y-2 border rounded-lg">
          <CalendarDays className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Failed to load seasons</h3>
          <p className="text-sm text-muted-foreground">
            {seasonsError.message || "An error occurred while loading seasons"}
          </p>
        </div>
      </div>
    );
  }

  // Check if we have all required data for the calendar
  const canShowCalendar = tenant?.id && selectedSeasonId;

  return (
    <ErrorBoundary>
      <EventDialogProvider>
        <div className="w-full space-y-6">
          <PageHeader
            title="Calendar"
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
                  onClick={() => {
                    setIsEditMode(false);
                    setSelectedSession(null);
                    setSelectedDate(new Date());
                    setIsAddSessionSheetOpen(true);
                  }}
                  permission={Permission.MANAGE_EVENTS}
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
              <AllGroupsEventCalendar
                tenant={tenant}
                seasonId={parseInt(selectedSeasonId)}
                season={calendarSeason}
                config={calendarConfig}
                onEventClick={handleEventClick}
                onEventDoubleClick={handleEventDoubleClick}
                onDateClick={handleDateClick}
                onAddSession={handleAddSession}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                className="min-h-[600px] border-0 rounded-none"
              />
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarDays className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                Organization Calendar
              </h3>
              <p className="text-sm">
                {!selectedSeason
                  ? "Please select a season to view events"
                  : "Loading calendar..."}
              </p>
            </div>
          )}
        </div>

        {/* Add/Edit Session Form */}
        <ResponsiveSheet
          isOpen={isAddSessionSheetOpen}
          setIsOpen={setIsAddSessionSheetOpen}
          title={isEditMode ? "Edit Session" : "Add Session"}
        >
          {selectedSeason && (
            <>
              {isEditMode && selectedSession ? (
                <EditSessionForm
                  session={selectedSession}
                  selectedSeason={selectedSeason}
                  tenant={tenant}
                  groups={groups}
                  setIsOpen={setIsAddSessionSheetOpen}
                  locations={locations}
                />
              ) : (
                <AddSessionForm
                  selectedSeason={selectedSeason}
                  tenant={tenant}
                  groups={groups}
                  setIsOpen={setIsAddSessionSheetOpen}
                  initialDate={selectedDate}
                  locations={locations}
                />
              )}
            </>
          )}
        </ResponsiveSheet>
      </EventDialogProvider>
    </ErrorBoundary>
  );
}
