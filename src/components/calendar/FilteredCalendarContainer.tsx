"use client";

import { useState } from "react";
import { CalendarContainer } from "./CalendarContainer";
import { SimpleFilter } from "./filters/SimpleFilter";
import { CalendarEvent } from "./EventCalendar";
import { CalendarViewType } from "./types";
import { Season } from "@/entities/season/Season.schema";

interface FilteredCalendarContainerProps {
  tenantId: string;
  selectedSeason: Season | null;
  tenantName: string;
  onEventClick?: (event: CalendarEvent) => void;
  defaultView?: CalendarViewType;
}

export function FilteredCalendarContainer(
  props: FilteredCalendarContainerProps
) {
  const { tenantId, selectedSeason, tenantName, onEventClick, defaultView } =
    props;
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);

  // A special calendar container that captures the events for filtering
  const EventCapturingCalendar = () => {
    return (
      <CalendarContainer
        {...props}
        onEventClick={(event) => {
          // Capture all events before they're rendered
          if (events.length === 0 && event.id) {
            // This is a hack to get all events
            // We need to extract them from the rendered events
            const allEventsOnPage = Array.from(
              document.querySelectorAll("[data-event-id]")
            )
              .map((el) => {
                const id = el.getAttribute("data-event-id");
                const type = el.getAttribute("data-event-type");
                return events.find(
                  (e) => e.id.toString() === id && e.type === type
                );
              })
              .filter(Boolean) as CalendarEvent[];

            if (allEventsOnPage.length > 0) {
              setEvents(allEventsOnPage);
            }
          }

          // Pass the click event through
          if (onEventClick) {
            onEventClick(event);
          }
        }}
      />
    );
  };

  return (
    <>
      <SimpleFilter
        events={events}
        tenantId={tenantId}
        tenantName={tenantName}
        onFilteredEventsChange={setFilteredEvents}
      />
      <div className="mt-4">
        <EventCapturingCalendar />
      </div>
    </>
  );
}
