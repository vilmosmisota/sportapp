import { SessionWithGroup } from "@/entities/session/Session.schema";
import { CalendarEvent, DateRange } from "./calendar.types";

/**
 * Session-specific calendar event
 */
export interface SessionEvent extends CalendarEvent<SessionWithGroup> {
  type: "session";
  groupName: string;
  locationName?: string;
  duration: number; // in minutes
}

/**
 * Event handlers for calendar interactions
 */
export interface CalendarEventHandlers<TEvent extends CalendarEvent> {
  onEventClick?: (event: TEvent) => void;
  onEventDoubleClick?: (event: TEvent) => void;
  onDateClick?: (date: Date) => void;
  onDateRangeChange?: (dateRange: DateRange) => void;
  onViewChange?: (view: string) => void;
}
