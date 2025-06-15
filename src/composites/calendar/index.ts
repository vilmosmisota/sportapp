// Types
export * from "./types/calendar.types";
export * from "./types/event.types";

// Components
export * from "./components/AllGroupsEventCalendar";
export * from "./components/Calendar";
export * from "./components/CalendarContextMenu";
export { DialogEventRenderer } from "./components/DialogEventRenderer";
export * from "./components/EventCalendar";
export { EventDetailsDialog } from "./components/EventDetailsDialog";
export { EventRenderer } from "./components/EventRenderer";

// Views
export * from "./components/views/DayView";
export * from "./components/views/MonthView";

// Loader
export * from "./loader";

// Hooks
export * from "./hooks/useCalendarInteraction";
export * from "./hooks/useCalendarNavigation";
export { useEventDetailsDialog } from "./hooks/useEventDetailsDialog";

// Providers
export * from "./providers/EventDataProvider";
export { EventDialogProvider } from "./providers/EventDialogProvider";

// Adapters
export * from "./adapters/SessionEventAdapter";

// Utils
export * from "./utils/date.utils";

// Types
export type {
  CalendarConfig,
  CalendarEvent,
  CalendarEventMetadata,
  CalendarView,
  DateRange,
} from "./types/calendar.types";

// For backward compatibility (deprecated)
/**
 * @deprecated Use EventDetailsDialog instead
 */
export { EventDetailsDialog as SessionDetailsDialog } from "./components/EventDetailsDialog";

/**
 * @deprecated Use useEventDetailsDialog instead
 */
export { useEventDetailsDialog as useSessionDetailsDialog } from "./hooks/useEventDetailsDialog";

/**
 * @deprecated Use useEventDialog instead
 */
export { useEventDialog as useSessionDialog } from "./providers/EventDialogProvider";

/**
 * @deprecated Use EventDialogProvider instead
 */
export { EventDialogProvider as SessionDialogProvider } from "./providers/EventDialogProvider";

/**
 * @deprecated Use EventCalendar instead
 */
export { EventCalendar as SessionCalendar } from "./components/EventCalendar";

/**
 * @deprecated Use AllGroupsEventCalendar instead
 */
export { AllGroupsEventCalendar as AllGroupsSessionCalendar } from "./components/AllGroupsEventCalendar";

/**
 * @deprecated Use DialogEventRenderer instead
 */
export { DialogEventRenderer as SessionEventRenderer } from "./components/DialogEventRenderer";

/**
 * @deprecated Use useEventCalendarData instead
 */
export { useEventCalendarData as useSessionCalendarData } from "./providers/EventDataProvider";

/**
 * @deprecated Use useAllGroupsEventCalendarData instead
 */
export { useAllGroupsEventCalendarData as useAllGroupsSessionCalendarData } from "./providers/EventDataProvider";
