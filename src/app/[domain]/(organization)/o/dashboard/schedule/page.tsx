"use client";

import { useState, useMemo, useEffect } from "react";
import { format, startOfMonth } from "date-fns";
import { CalendarEvent } from "@/components/calendar/EventCalendar";
import { EventDetailsDialog } from "@/components/calendar/EventDetailsDialog";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
import EditTrainingForm from "./forms/EditTrainingForm";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleFilter } from "@/components/calendar/filters/SimpleFilter";
import { CalendarContainer } from "@/components/calendar/CalendarContainer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Cog } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { useDeleteTraining } from "@/entities/training/Training.actions.client";
import { useDeleteGame } from "@/entities/game/Game.actions.client";
import { toast } from "sonner";
import { isTrainingEvent, isGameEvent } from "@/components/calendar/types";
import { useTraining } from "@/entities/training/Training.query";
import { extractNumericId } from "../../../../../../utils/string.utils";

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
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingTrainingId, setEditingTrainingId] = useState<number | null>(
    null
  );

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(
    null
  );

  const { data: tenant } = useTenantByDomain(params.domain);
  const { data: seasons } = useSeasonsByTenantId(tenant?.id?.toString() || "");

  const { data: editingTraining } = useTraining(
    tenant?.id?.toString() || "",
    editingTrainingId || 0
  );

  const deleteTraining = useDeleteTraining(tenant?.id?.toString() || "");

  const deleteGame = useDeleteGame(tenant?.id?.toString() || "");

  const isLoadingTenantData = !tenant || !seasons;

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

    if (isTrainingEvent(event)) {
      const trainingId = extractNumericId(event.id, "training-");

      if (trainingId) {
        setEditingTrainingId(trainingId);
        setIsEditFormOpen(true);
      } else {
        toast.error("Invalid training ID");
      }
    } else if (isGameEvent(event)) {
      toast.info("Game editing will be available in a future update");
    }
  };

  const handleEventDelete = (event: CalendarEvent) => {
    setIsEventDetailsOpen(false);
    setEventToDelete(event);
    setIsDeleteConfirmOpen(true);
  };

  const executeDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      let deletedId: number;

      if (isTrainingEvent(eventToDelete)) {
        const trainingId = extractNumericId(eventToDelete.id, "training-");
        if (!trainingId) {
          throw new Error(`Invalid training ID: ${eventToDelete.id}`);
        }
        await deleteTraining.mutateAsync(trainingId);
        deletedId = trainingId;
      } else if (isGameEvent(eventToDelete)) {
        const gameId = extractNumericId(eventToDelete.id, "game-");
        if (!gameId) {
          throw new Error(`Invalid game ID: ${eventToDelete.id}`);
        }
        await deleteGame.mutateAsync(gameId);
        deletedId = gameId;
      } else {
        throw new Error("Unsupported event type");
      }

      const updateEvents = (events: CalendarEvent[]) =>
        events.filter((e) => e.id !== eventToDelete.id);

      setCalendarEvents(updateEvents);
      setFilteredEvents((prev) =>
        prev.length !== calendarEvents.length ? updateEvents(prev) : prev
      );

      toast.success(`${eventToDelete.type} deleted successfully`);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete event"
      );
    } finally {
      setEventToDelete(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleSeasonChange = (seasonId: string) => {
    const selected = seasons?.find((s) => s.id === parseInt(seasonId));
    if (!selected) return;
  };

  const handleEventsCapture = (events: CalendarEvent[]) => {
    const haveEventsChanged =
      events.length !== calendarEvents.length ||
      JSON.stringify(events.map((e) => e.id).sort()) !==
        JSON.stringify(calendarEvents.map((e) => e.id).sort());

    if (haveEventsChanged) {
      setCalendarEvents(events);

      // Also update filtered events if any event in the filtered set has been updated
      if (filteredEvents.length > 0) {
        const updatedFilteredEvents = filteredEvents.map((filteredEvent) => {
          // Try to find updated version of this event
          const updatedEvent = events.find((e) => e.id === filteredEvent.id);
          // Return updated version if found, otherwise keep the original
          return updatedEvent || filteredEvent;
        });

        // Only update if there are actual changes
        if (
          JSON.stringify(updatedFilteredEvents) !==
          JSON.stringify(filteredEvents)
        ) {
          setFilteredEvents(updatedFilteredEvents);
        }
      } else {
        // If no filters are applied, filtered events should match all events
        setFilteredEvents(events);
      }
    }
  };

  const handleFilteredEventsChange = (filtered: CalendarEvent[]) => {
    // When filtered events change, we want to ensure they contain the latest data
    // from calendarEvents for any matching events
    if (calendarEvents.length > 0) {
      const updatedFiltered = filtered.map((filteredEvent) => {
        const latestEvent = calendarEvents.find(
          (e) => e.id === filteredEvent.id
        );
        return latestEvent || filteredEvent;
      });
      setFilteredEvents(updatedFiltered);
    } else {
      setFilteredEvents(filtered);
    }
  };

  if (seasons?.length === 0) {
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
            <h3 className="text-xl font-semibold mb-2">No Seasons Found</h3>
            <p className="text-muted-foreground mb-6">
              To start scheduling games and trainings, you need to create a
              season first. A season defines the date range and teams for your
              schedule.
            </p>

            <Alert variant="default" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Getting Started</AlertTitle>
              <AlertDescription>
                Create your first season to start managing your schedule. You
                can set up multiple seasons and switch between them at any time.
              </AlertDescription>
            </Alert>

            <Link href="/o/dashboard/settings/seasons">
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Season
              </Button>
            </Link>
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

      {/* Edit Training dialog */}
      <ResponsiveSheet
        isOpen={isEditFormOpen}
        setIsOpen={(open) => {
          setIsEditFormOpen(open);
          if (!open) setEditingTrainingId(null);
        }}
        title="Edit Training"
      >
        <>
          {isLoadingTenantData ||
          !tenant ||
          !selectedSeason ||
          !editingTraining ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-[120px] mt-4" />
            </div>
          ) : (
            <EditTrainingForm
              tenantId={tenant.id.toString()}
              domain={params.domain}
              selectedSeason={selectedSeason}
              tenant={tenant}
              setIsOpen={setIsEditFormOpen}
              trainingToEdit={editingTraining}
              trainingId={editingTrainingId}
            />
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
