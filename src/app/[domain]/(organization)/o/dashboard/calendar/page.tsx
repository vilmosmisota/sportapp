"use client";

import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  EventCalendar,
  CalendarEvent,
} from "@/components/calendar/EventCalendar";
import { EventDetailsDialog } from "@/components/calendar/EventDetailsDialog";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { SimpleFilter } from "@/components/calendar/filters/SimpleFilter";
import { useCalendarEvents } from "@/components/calendar/hooks/useCalendarEvents";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PageProps = {
  params: {
    domain: string;
  };
};

export default function CalendarPage({ params }: PageProps) {
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });

  const { data: tenant } = useTenantByDomain(params.domain);
  const { data: seasons } = useSeasonsByTenantId(tenant?.id?.toString() || "");

  const selectedSeason = useMemo(() => {
    if (!seasons) return undefined;
    return seasons.find((season) => season.isActive) || seasons[0];
  }, [seasons]);

  const { data: events, isLoading } = useCalendarEvents(
    tenant?.id?.toString() || "",
    dateRange.start,
    dateRange.end,
    selectedSeason?.id || 0,
    !!tenant && !!selectedSeason
  );

  // Update filtered events when events change
  useEffect(() => {
    if (events && events.length > 0 && filteredEvents.length === 0) {
      setFilteredEvents(events);
    }
  }, [events, filteredEvents.length]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    // Only update the dateRange state if the range has actually changed
    setDateRange((prev) => {
      if (
        prev.start.getTime() === start.getTime() &&
        prev.end.getTime() === end.getTime()
      ) {
        return prev; // No change needed
      }
      console.log(
        `Date range changed: ${format(start, "yyyy-MM-dd")} to ${format(
          end,
          "yyyy-MM-dd"
        )}`
      );
      return { start, end };
    });
  };

  // Handle event edit
  const handleEventEdit = (event: CalendarEvent) => {
    toast.info("Edit functionality would open here", {
      description: `Editing ${event.type}: ${event.title}`,
    });
    setIsEventDetailsOpen(false);
    // In a real app, you would open edit form here
  };

  // Handle event delete
  const handleEventDelete = (event: CalendarEvent) => {
    toast.info("Delete functionality would be triggered here", {
      description: `Deleting ${event.type}: ${event.title}`,
    });
    setIsEventDetailsOpen(false);
    // In a real app, you would confirm and delete the event
  };

  // Handle season change
  const handleSeasonChange = (seasonId: string) => {
    const selected = seasons?.find((s) => s.id === parseInt(seasonId));

    // If no season was found, don't update
    if (!selected) return;

    // Update date range to match season dates if available
    if (selected.startDate && selected.endDate) {
      setDateRange({
        start: new Date(selected.startDate),
        end: new Date(selected.endDate),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex space-x-2">
          {/* Season selector */}
          {seasons && seasons.length > 0 && (
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
          )}

          <Button onClick={() => setIsCreateFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Simple filter component */}
      <SimpleFilter
        events={events || []}
        onFilteredEventsChange={setFilteredEvents}
        dateRange={dateRange}
      />

      {/* Main calendar component */}
      <Card>
        <CardContent className="pt-6">
          <EventCalendar
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateRangeChange={handleDateRangeChange}
            defaultView="day"
            isLoading={isLoading}
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
        />
      )}

      {/* Event creation dialog */}
      <ResponsiveSheet
        isOpen={isCreateFormOpen}
        setIsOpen={setIsCreateFormOpen}
        title="Create Event"
      >
        <div className="space-y-4 p-4">
          <p className="text-sm text-muted-foreground">
            Event creation form would go here in a real app.
          </p>
          <Button onClick={() => setIsCreateFormOpen(false)}>Close</Button>
        </div>
      </ResponsiveSheet>
    </div>
  );
}
