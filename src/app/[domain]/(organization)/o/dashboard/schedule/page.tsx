"use client";

import { useState, useMemo, useEffect } from "react";
import { format, startOfMonth } from "date-fns";
import { CalendarEvent } from "@/components/calendar/EventCalendar";
import { EventDetailsDialog } from "@/components/calendar/EventDetailsDialog";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddEventForm from "./forms/AddEventForm";
import AddTrainingForm from "./forms/AddTrainingForm";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleFilter } from "@/components/calendar/filters/SimpleFilter";
import { CalendarContainer } from "@/components/calendar/CalendarContainer";
import { EventCalendar } from "@/components/calendar/EventCalendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Cog } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { useDeleteTraining } from "@/entities/training/Training.actions.client";
import { useDeleteGame } from "@/entities/game/Game.actions.client";
import { toast } from "sonner";
import { isTrainingEvent, isGameEvent } from "@/components/calendar/types";

// Define an enum for event types
enum EventType {
  Game = "game",
  Training = "training",
}

type PageProps = {
  params: {
    domain: string;
  };
};

export default function CalendarPage({ params }: PageProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType>(
    EventType.Game
  );
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [isNoSeasonsDialogOpen, setIsNoSeasonsDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Add state for delete confirmation dialog
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(
    null
  );

  const { data: tenant } = useTenantByDomain(params.domain);
  const { data: seasons } = useSeasonsByTenantId(tenant?.id?.toString() || "");

  // Initialize the delete training mutation hook
  const deleteTraining = useDeleteTraining(tenant?.id?.toString() || "");

  // Initialize the delete game mutation hook
  const deleteGame = useDeleteGame(tenant?.id?.toString() || "");

  // Add state for configuration status
  const [teamManagementConfigComplete, setTeamManagementConfigComplete] =
    useState<boolean | null>(null);
  const [trainingLocationsConfigured, setTrainingLocationsConfigured] =
    useState<boolean | null>(null);
  const [gameLocationsConfigured, setGameLocationsConfigured] = useState<
    boolean | null
  >(null);

  // Fetch configuration status - Simplified example, in a real app would call API
  useEffect(() => {
    if (tenant?.id) {
      // These would be API calls in a real implementation
      setTeamManagementConfigComplete(false); // Example placeholder
      setTrainingLocationsConfigured(false); // Example placeholder
      setGameLocationsConfigured(false); // Example placeholder
    }
  }, [tenant?.id]);

  const selectedSeason = useMemo(() => {
    if (!seasons) return undefined;
    return seasons.find((season) => season.isActive) || seasons[0];
  }, [seasons]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  const handleEventEdit = (event: CalendarEvent) => {
    setIsEventDetailsOpen(false);
  };

  const handleEventDelete = (event: CalendarEvent) => {
    // Close the event details dialog
    setIsEventDetailsOpen(false);

    // Store the event to delete and open confirmation dialog
    setEventToDelete(event);
    setIsDeleteConfirmOpen(true);
  };

  // Helper function to extract numeric ID from prefixed ID string
  const extractNumericId = (
    prefixedId: string | number,
    prefix: string
  ): number | null => {
    if (typeof prefixedId === "number") return prefixedId;

    if (typeof prefixedId === "string" && prefixedId.startsWith(prefix)) {
      const idStr = prefixedId.replace(prefix, "");
      const id = parseInt(idStr);
      return isNaN(id) ? null : id;
    }

    // Try to parse the provided ID as a fallback
    const fallbackId = parseInt(String(prefixedId));
    return isNaN(fallbackId) ? null : fallbackId;
  };

  // Function to execute the delete operation after confirmation
  const executeDeleteEvent = async (eventId: string) => {
    if (!eventToDelete) return;

    // Helper function to update event lists after deletion
    const updateEventLists = (deletedEventId: string | number) => {
      // Update the local state by removing the deleted event
      const updatedEvents = calendarEvents.filter(
        (e) => e.id !== deletedEventId
      );
      setCalendarEvents(updatedEvents);

      // If filtered events are being shown, update those too
      if (filteredEvents.length !== calendarEvents.length) {
        const updatedFilteredEvents = filteredEvents.filter(
          (e) => e.id !== deletedEventId
        );
        setFilteredEvents(updatedFilteredEvents);
      }
    };

    try {
      // Check if the event is a training event
      if (isTrainingEvent(eventToDelete)) {
        // Extract training ID with the 'training-' prefix
        const trainingId = extractNumericId(eventToDelete.id, "training-");

        if (!trainingId) {
          console.error("Failed to parse training ID:", eventToDelete.id);
          toast.error("Invalid training ID");
          return;
        }

        // Execute the delete operation
        await deleteTraining.mutateAsync(trainingId);

        // Update the events lists
        updateEventLists(eventToDelete.id);

        toast.success("Training deleted successfully");
      } else if (isGameEvent(eventToDelete)) {
        // Extract game ID with the 'game-' prefix
        const gameId = extractNumericId(eventToDelete.id, "game-");

        if (!gameId) {
          console.error("Failed to parse game ID:", eventToDelete.id);
          toast.error("Invalid game ID");
          return;
        }

        // Execute the delete operation
        await deleteGame.mutateAsync(gameId);

        // Update the events lists
        updateEventLists(eventToDelete.id);

        toast.success("Game deleted successfully");
      } else {
        // For other event types, show an error
        toast.error("Deleting this event type is not supported yet");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    } finally {
      // Reset state
      setEventToDelete(null);
    }
  };

  const handleSeasonChange = (seasonId: string) => {
    const selected = seasons?.find((s) => s.id === parseInt(seasonId));
    if (!selected) return;
  };

  // Event capture function for the calendar
  const handleEventsCapture = (events: CalendarEvent[]) => {
    // Check if we actually have different events to avoid unnecessary state updates
    const haveEventsChanged =
      events.length !== calendarEvents.length ||
      JSON.stringify(events.map((e) => e.id).sort()) !==
        JSON.stringify(calendarEvents.map((e) => e.id).sort());

    if (haveEventsChanged) {
      setCalendarEvents(events);

      // Only reset filtered events if we need to (if they're based on old data)
      const areFiltersApplied = filteredEvents.length !== calendarEvents.length;
      if (!areFiltersApplied) {
        setFilteredEvents(events);
      }
    }
  };

  // This effect handles filtered events changes for debugging
  useEffect(() => {
    // Left intentionally empty - we only track changes
  }, [filteredEvents, calendarEvents]);

  // Handle filtered events from the SimpleFilter component
  const handleFilteredEventsChange = (filtered: CalendarEvent[]) => {
    // Update state with the newly filtered events
    setFilteredEvents(filtered);
  };

  const isLoadingTenantData = !tenant || !seasons;
  const hasNoSeasons =
    !isLoadingTenantData && (!seasons || seasons.length === 0);
  const isLoadingConfig =
    teamManagementConfigComplete === null ||
    trainingLocationsConfigured === null ||
    gameLocationsConfigured === null;

  // If there are no seasons, show the empty state
  if (hasNoSeasons) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Schedule"
          description="View and manage your schedule of games and trainings"
        />

        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <div className="flex flex-col items-center max-w-lg">
            <div className="bg-muted h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Schedule Setup Required
            </h3>
            <p className="text-muted-foreground mb-6">
              Before you can start scheduling games and trainings, you need to
              set up your organization and create a season. Please complete the
              following setup steps:
            </p>

            <div className="w-full text-left mb-6 space-y-3 bg-muted p-4 rounded-lg">
              <h4 className="font-medium">Setup Checklist:</h4>

              <div className="flex items-start gap-2">
                {isLoadingConfig ? (
                  <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
                ) : teamManagementConfigComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-medium">
                    Team Management Configuration
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Configure age groups, skill levels, and player positions in
                    Organization settings
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                {isLoadingConfig ? (
                  <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
                ) : trainingLocationsConfigured ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-medium">Training Locations</div>
                  <div className="text-sm text-muted-foreground">
                    Add at least one training location in Organization settings
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                {isLoadingConfig ? (
                  <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
                ) : gameLocationsConfigured ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-medium">Game Locations</div>
                  <div className="text-sm text-muted-foreground">
                    Add at least one game location in Organization settings
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Season Creation</div>
                  <div className="text-sm text-muted-foreground">
                    Create at least one season to define the date range and
                    teams for your schedule
                  </div>
                </div>
              </div>
            </div>

            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuration Required</AlertTitle>
              <AlertDescription>
                Complete the organization setup before creating your first
                season and scheduling events.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  window.location.href = `/o/dashboard/settings/organization`;
                }}
                variant="default"
              >
                <Cog className="h-4 w-4 mr-2" />
                Organization Settings
              </Button>

              <Button
                onClick={() => {
                  window.location.href = `/o/dashboard/settings/seasons`;
                }}
                variant="outline"
                disabled={!teamManagementConfigComplete}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Season
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Schedule"
        description={
          selectedSeason
            ? (() => {
                const dateRange = `${format(
                  new Date(selectedSeason.startDate),
                  "dd/MM/yyyy"
                )} - ${format(new Date(selectedSeason.endDate), "dd/MM/yyyy")}`;

                return `Calendar view for ${
                  selectedSeason.customName
                    ? `${selectedSeason.customName} (${dateRange})`
                    : dateRange
                }`;
              })()
            : "View and manage your schedule of games and trainings"
        }
        actions={
          <div className="flex space-x-2">
            {/* Filter status indicator */}
            {calendarEvents.length > 0 &&
              filteredEvents.length !== calendarEvents.length && (
                <span className="text-sm text-muted-foreground self-center">
                  Showing {filteredEvents.length} of {calendarEvents.length}{" "}
                  events
                </span>
              )}

            {/* Season selector with loading state */}
            {isLoadingTenantData ? (
              <Skeleton className="h-10 w-[180px]" />
            ) : seasons && seasons.length > 0 ? (
              <Select
                value={selectedSeason?.id.toString()}
                onValueChange={handleSeasonChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.id.toString()}>
                      {season.customName || `Season ${season.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}

            {/* Add Event button with loading state */}
            {isLoadingTenantData ? (
              <Skeleton className="h-10 w-[120px]" />
            ) : (
              <Button onClick={() => setIsCreateFormOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Event
              </Button>
            )}
          </div>
        }
      />

      {/* Filter card */}
      {!isLoadingTenantData && (
        <Card className="mb-4">
          <CardContent className="py-4">
            <SimpleFilter
              events={calendarEvents}
              tenantId={tenant?.id?.toString() || ""}
              tenantName={tenant?.name || "Our Team"}
              onFilteredEventsChange={handleFilteredEventsChange}
              key={`filter-${format(currentMonth, "yyyy-MM")}-${
                calendarEvents.length
              }`}
            />
          </CardContent>
        </Card>
      )}

      {/* Main calendar component */}
      <Card>
        <CardContent className="py-6">
          <CalendarContainer
            tenantId={tenant?.id?.toString() || ""}
            selectedSeason={selectedSeason || null}
            tenantName={tenant?.name || "Our Team"}
            onEventClick={handleEventClick}
            onEventsLoad={handleEventsCapture}
            defaultView="month"
            filteredEvents={
              filteredEvents.length > 0 ? filteredEvents : undefined
            }
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        </CardContent>
      </Card>

      {/* Event details dialog */}
      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          isOpen={isEventDetailsOpen}
          onClose={() => setIsEventDetailsOpen(false)}
          onEdit={handleEventEdit}
          onDelete={handleEventDelete}
          isLoading={false}
        />
      )}

      {/* Event creation dialog */}
      <ResponsiveSheet
        isOpen={isCreateFormOpen}
        setIsOpen={setIsCreateFormOpen}
        title="Create Event"
      >
        <>
          {isLoadingTenantData || !tenant || !selectedSeason ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-[120px] mt-4" />
            </div>
          ) : (
            <Tabs
              defaultValue={EventType.Game}
              value={selectedEventType}
              onValueChange={(value) =>
                setSelectedEventType(value as EventType)
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value={EventType.Game}>Game</TabsTrigger>
                <TabsTrigger value={EventType.Training}>Training</TabsTrigger>
              </TabsList>

              <TabsContent value={EventType.Game}>
                <AddEventForm
                  tenantId={tenant.id.toString()}
                  domain={params.domain}
                  selectedSeason={selectedSeason}
                  tenant={tenant}
                  setIsOpen={setIsCreateFormOpen}
                />
              </TabsContent>

              <TabsContent value={EventType.Training}>
                <AddTrainingForm
                  tenantId={tenant.id.toString()}
                  domain={params.domain}
                  selectedSeason={selectedSeason}
                  tenant={tenant}
                  setIsOpen={setIsCreateFormOpen}
                />
              </TabsContent>
            </Tabs>
          )}
        </>
      </ResponsiveSheet>

      {/* Add Delete Confirmation Dialog */}
      {eventToDelete && (
        <ConfirmDeleteDialog
          categoryId={
            // Use the extractNumericId helper to get the ID correctly for both game and training events
            typeof eventToDelete.id === "string"
              ? isTrainingEvent(eventToDelete)
                ? extractNumericId(eventToDelete.id, "training-")?.toString() ||
                  ""
                : isGameEvent(eventToDelete)
                ? extractNumericId(eventToDelete.id, "game-")?.toString() || ""
                : eventToDelete.id
              : eventToDelete.id.toString()
          }
          isOpen={isDeleteConfirmOpen}
          setIsOpen={setIsDeleteConfirmOpen}
          text={`This will permanently delete this ${eventToDelete.type} event. This action cannot be undone. Are you sure you want to proceed?`}
          onConfirm={executeDeleteEvent}
        />
      )}
    </div>
  );
}
