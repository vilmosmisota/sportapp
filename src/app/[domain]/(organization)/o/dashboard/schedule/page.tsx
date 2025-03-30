"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { CalendarEvent } from "@/components/calendar/EventCalendar";
import { EventDetailsDialog } from "@/components/calendar/EventDetailsDialog";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

  const { data: tenant } = useTenantByDomain(params.domain);
  const { data: seasons } = useSeasonsByTenantId(tenant?.id?.toString() || "");

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
    setIsEventDetailsOpen(false);
  };

  const handleSeasonChange = (seasonId: string) => {
    const selected = seasons?.find((s) => s.id === parseInt(seasonId));
    if (!selected) return;
  };

  // Event capture function for the calendar
  const handleEventsCapture = (events: CalendarEvent[]) => {
    // Only set calendarEvents the first time to avoid replacing user-filtered events
    if (events.length > 0 && calendarEvents.length === 0) {
      console.log("Captured initial events:", events.length);
      setCalendarEvents(events);
      setFilteredEvents(events); // Initialize filtered events with all events
    }
  };

  // This effect handles filtered events changes for debugging
  useEffect(() => {
    if (filteredEvents.length > 0) {
      console.log(
        `Calendar showing ${filteredEvents.length} of ${calendarEvents.length} total events`
      );
    }
  }, [filteredEvents, calendarEvents]);

  // Handle filtered events from the SimpleFilter component
  const handleFilteredEventsChange = (filtered: CalendarEvent[]) => {
    // Update state with the newly filtered events
    setFilteredEvents(filtered);
  };

  const isLoadingTenantData = !tenant || !seasons;

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
            />
          </CardContent>
        </Card>
      )}

      {/* Main calendar component */}
      <Card>
        <CardContent className="py-6">
          {calendarEvents.length === 0 ? (
            <CalendarContainer
              tenantId={tenant?.id?.toString() || ""}
              selectedSeason={selectedSeason || null}
              tenantName={tenant?.name || "Our Team"}
              onEventClick={handleEventClick}
              onEventsLoad={handleEventsCapture}
              defaultView="day"
            />
          ) : (
            <EventCalendar
              events={filteredEvents}
              onEventClick={handleEventClick}
              defaultView="day"
              isLoading={false}
              seasonBreaks={selectedSeason?.breaks || []}
              seasonDateRange={
                selectedSeason
                  ? {
                      startDate: selectedSeason.startDate,
                      endDate: selectedSeason.endDate,
                    }
                  : null
              }
              onDateRangeChange={(start, end) => {
                // Only log the date change but don't reload events
                console.log("Date range changed", {
                  start: start.toISOString().split("T")[0],
                  end: end.toISOString().split("T")[0],
                });
              }}
            />
          )}
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
    </div>
  );
}
