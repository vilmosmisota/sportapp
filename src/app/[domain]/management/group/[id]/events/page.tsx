"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { SeasonSelector } from "@/components/ui/season-selector";
import { PermissionButton } from "@/composites/auth/PermissionButton";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import {
  CalendarConfig,
  CalendarLoader,
  EventCalendar,
  SessionEvent,
  seasonToCalendarSeason,
} from "@/composites/calendar";
import { useGroupConnections } from "@/entities/group/GroupConnection.query";
import { Permission } from "@/entities/role/Role.permissions";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { Session } from "@/entities/session/Session.schema";
import { Calendar, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ResponsiveSheet } from "../../../../../../components/ui/responsive-sheet";
import AddSessionForm from "./components/forms/AddSessionForm";
import EditSessionForm from "./components/forms/EditSessionForm";

interface GroupEventsPageProps {
  params: {
    domain: string;
    id: string;
  };
}

export default function GroupEventsPage({ params }: GroupEventsPageProps) {
  const { tenant } = useTenantAndUserAccessContext();
  const groupId = parseInt(params.id);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [isAddSessionSheetOpen, setIsAddSessionSheetOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const {
    data: groupData,
    error,
    isLoading,
  } = useGroupConnections(
    tenant?.id.toString() || "",
    groupId,
    !!tenant?.id && !!groupId
  );

  const { data: seasons, isLoading: seasonsLoading } = useSeasonsByTenantId(
    tenant?.id.toString() || ""
  );

  const activeSeason = seasons?.find((season) => season.isActive);

  useEffect(() => {
    if (activeSeason && !selectedSeasonId) {
      setSelectedSeasonId(activeSeason.id.toString());
    }
  }, [activeSeason, selectedSeasonId]);

  const selectedSeason = seasons?.find(
    (season) => season.id.toString() === selectedSeasonId
  );

  const calendarSeason = useMemo(() => {
    if (!selectedSeason) return undefined;
    return seasonToCalendarSeason(selectedSeason);
  }, [selectedSeason]);

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

  const handleEventClick = (event: SessionEvent) => {
    console.log("Session clicked:", event);
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

  const handleEditEvent = (event: SessionEvent) => {
    // Extract the session data from the event
    if (event.type === "session" && event.data) {
      const session = event.data as Session;
      console.log("Edit session:", session);
      setIsEditMode(true);
      setSelectedSession(session);
      setIsAddSessionSheetOpen(true);
    }
  };

  const handleDeleteEvent = (event: SessionEvent) => {
    if (event.type === "session" && event.data) {
      const session = event.data as Session;
      console.log("Delete session:", session);
    }
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

  if (error || !groupData || !tenant || !selectedSeason) {
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

  const getDescription = () => {
    if (selectedSeason) {
      const seasonName =
        selectedSeason.customName || `Season ${selectedSeason.id}`;
      return `Manage events and activities • ${seasonName}`;
    }
    return "Manage events and activities";
  };

  // Check if we have all required data for the calendar
  const canShowCalendar = tenant?.id && groupId && selectedSeasonId;

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
            <EventCalendar
              tenant={tenant}
              groupId={groupId}
              seasonId={parseInt(selectedSeasonId)}
              season={calendarSeason}
              config={calendarConfig}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              onAddSession={handleAddSession}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              className="h-full border-0 rounded-none"
            />
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Event Calendar</h3>
            <p className="text-sm">
              {!selectedSeason
                ? "Please select a season to view events"
                : "Loading calendar..."}
            </p>
          </div>
        )}
      </div>

      <ResponsiveSheet
        isOpen={isAddSessionSheetOpen}
        setIsOpen={setIsAddSessionSheetOpen}
        title={isEditMode ? "Edit Session" : "Add Session"}
      >
        {isEditMode && selectedSession && selectedSeason ? (
          <EditSessionForm
            session={selectedSession}
            selectedSeason={selectedSeason}
            tenant={tenant}
            setIsOpen={setIsAddSessionSheetOpen}
            locations={
              tenant?.tenantConfigs?.development?.trainingLocations || []
            }
          />
        ) : (
          <AddSessionForm
            selectedSeason={selectedSeason}
            tenant={tenant}
            groupId={groupId}
            setIsOpen={setIsAddSessionSheetOpen}
            initialDate={selectedDate}
            locations={
              tenant?.tenantConfigs?.development?.trainingLocations || []
            }
          />
        )}
      </ResponsiveSheet>
    </ErrorBoundary>
  );
}
