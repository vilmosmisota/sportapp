"use client";

import { CalendarEvent } from "@/components/calendar/EventCalendar";
import { EventDetailsDialog } from "@/components/calendar/EventDetailsDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { format, startOfDay } from "date-fns";
import {
  AlertCircle,
  CalendarDays,
  Dumbbell,
  Plus,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { CalendarContainer } from "@/components/calendar/CalendarContainer";
import { SimpleFilter } from "@/components/calendar/filters/SimpleFilter";
import { isGameEvent, isTrainingEvent } from "@/components/calendar/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/ui/page-header";
import { SeasonSelector } from "@/components/ui/season-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteGame } from "@/entities/game/Game.actions.client";
import { useDeleteTraining } from "@/entities/training/Training.actions.client";
import { useTraining } from "@/entities/training/Training.query";
import { toast } from "sonner";
import { extractNumericId } from "../../../../../../utils/string.utils";
import AddGameForm from "./forms/AddGameForm";
import AddTrainingForm from "./forms/AddTrainingForm";
import EditGameForm from "./forms/EditGameForm";
import EditTrainingForm from "./forms/EditTrainingForm";

import { useGameById } from "@/entities/game/Game.query";
import { useTenantAndUserAccessContext } from "../../../../../../composites/auth/TenantAndUserAccessContext";

enum EventType {
  Game = "game",
  Training = "training",
}

export default function CalendarPage() {
  const { tenant } = useTenantAndUserAccessContext();

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
  const [activeDay, setActiveDay] = useState<Date | null>(null);

  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingTrainingId, setEditingTrainingId] = useState<number | null>(
    null
  );
  const [editingGameId, setEditingGameId] = useState<number | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(
    null
  );

  // Context menu state
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const { data: seasons } = useSeasonsByTenantId(tenant?.id?.toString() || "");

  const { data: editingTraining } = useTraining(
    tenant?.id?.toString() || "",
    editingTrainingId || 0
  );

  const { data: editingGame } = useGameById(
    tenant?.id?.toString() || "",
    editingGameId || 0
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

    // Set the active day to the event's start date
    setActiveDay(startOfDay(event.start));
  };

  const handleEventEdit = (event: CalendarEvent) => {
    setIsEventDetailsOpen(false);

    // Set the active day to the event's start date when editing
    setActiveDay(startOfDay(event.start));

    if (isTrainingEvent(event)) {
      const trainingId = extractNumericId(event.id, "training-");
      if (trainingId) {
        setEditingTrainingId(trainingId);
        setIsEditFormOpen(true);
      } else {
        toast.error("Invalid training ID");
      }
    } else if (isGameEvent(event)) {
      const gameId = extractNumericId(event.id, "game-");
      if (gameId) {
        setEditingGameId(gameId);
        setIsEditFormOpen(true);
      } else {
        toast.error("Invalid game ID");
      }
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

  // Handle context menu on the calendar
  const handleDayContextMenu = (date: Date, event: React.MouseEvent) => {
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setSelectedDate(date);

    // Set the active day when opening context menu
    setActiveDay(date);
  };

  // Handle context menu item clicks
  const handleAddGame = () => {
    if (selectedDate) {
      setSelectedEventType(EventType.Game);
      setIsCreateFormOpen(true);
      setContextMenuPosition(null);
    }
  };

  const handleAddTraining = () => {
    if (selectedDate) {
      setSelectedEventType(EventType.Training);
      setIsCreateFormOpen(true);
      setContextMenuPosition(null);
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenuPosition(null);
      }
    };

    if (contextMenuPosition) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenuPosition]);

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

  // Update setActiveDay when a form is closed to make sure the active day is set to the event day
  const handleCreateFormClose = (
    value: boolean | ((prevState: boolean) => boolean)
  ) => {
    // Convert function to boolean if needed
    const open = typeof value === "function" ? value(isCreateFormOpen) : value;
    setIsCreateFormOpen(open);
    if (!open) {
      // Preserve the selected date as the active day when closing the create form
      if (selectedDate) {
        setActiveDay(selectedDate);
      }
      setSelectedDate(null);
    }
  };

  const handleEditFormClose = (
    value: boolean | ((prevState: boolean) => boolean)
  ) => {
    // Convert function to boolean if needed
    const open = typeof value === "function" ? value(isEditFormOpen) : value;
    setIsEditFormOpen(open);
    if (!open) {
      // For editing, we want to preserve the active day for the event being edited
      if (editingTraining) {
        setActiveDay(startOfDay(new Date(editingTraining.date)));
      } else if (editingGame) {
        setActiveDay(startOfDay(new Date(editingGame.date)));
      }
      setEditingTrainingId(null);
      setEditingGameId(null);
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

            <Link href="/management/seasons">
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
            <SeasonSelector
              seasons={seasons}
              selectedSeason={selectedSeason}
              onSeasonChange={handleSeasonChange}
              isLoading={isLoadingTenantData}
              placeholder="Select season"
              width="w-[180px]"
            />

            {/* Add Event button with loading state */}
            {isLoadingTenantData ? (
              <Skeleton className="h-10 w-[120px]" />
            ) : (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Event
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedEventType(EventType.Game);
                      setIsCreateFormOpen(true);
                    }}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>Game</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedEventType(EventType.Training);
                      setIsCreateFormOpen(true);
                    }}
                  >
                    <Dumbbell className="mr-2 h-4 w-4" />
                    <span>Training</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />

      {/* Filter card */}
      {!isLoadingTenantData && (
        <Card className="mb-4 shadow-none">
          <CardContent className="py-0">
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
        <CardContent className="p-0 md:p-6 pt-6 md:py-6">
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
            onDayContextMenu={handleDayContextMenu}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
          />
        </CardContent>
      </Card>

      {/* Context menu for adding events */}
      {contextMenuPosition && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
          style={{
            top: `${contextMenuPosition.y}px`,
            left: `${contextMenuPosition.x}px`,
          }}
        >
          <div className="flex flex-col">
            <button
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={handleAddGame}
            >
              <Trophy className="mr-2 h-4 w-4" />
              <span>Add Game</span>
            </button>
            <button
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={handleAddTraining}
            >
              <Dumbbell className="mr-2 h-4 w-4" />
              <span>Add Training</span>
            </button>
          </div>
        </div>
      )}

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
        setIsOpen={handleCreateFormClose}
        title={
          selectedEventType === EventType.Game
            ? "Create Game"
            : "Create Training"
        }
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
            <>
              {selectedEventType === EventType.Game ? (
                <AddGameForm
                  selectedSeason={selectedSeason}
                  tenant={tenant}
                  setIsOpen={handleCreateFormClose}
                  initialDate={selectedDate}
                />
              ) : (
                <AddTrainingForm
                  selectedSeason={selectedSeason}
                  tenant={tenant}
                  setIsOpen={handleCreateFormClose}
                  initialDate={selectedDate}
                />
              )}
            </>
          )}
        </>
      </ResponsiveSheet>

      {/* Edit Training/Game dialog */}
      <ResponsiveSheet
        isOpen={isEditFormOpen}
        setIsOpen={handleEditFormClose}
        title={editingGameId ? "Edit Game" : "Edit Training"}
      >
        <>
          {isLoadingTenantData ||
          !tenant ||
          !selectedSeason ||
          (editingGameId && !editingGame) ||
          (editingTrainingId && !editingTraining) ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-[120px] mt-4" />
            </div>
          ) : editingGameId && editingGame ? (
            <EditGameForm
              selectedSeason={selectedSeason}
              tenant={tenant}
              game={editingGame}
              setIsOpen={handleEditFormClose}
            />
          ) : editingTrainingId && editingTraining ? (
            <EditTrainingForm
              selectedSeason={selectedSeason}
              tenant={tenant}
              setIsOpen={handleEditFormClose}
              trainingToEdit={editingTraining}
              trainingId={editingTrainingId}
            />
          ) : null}
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
