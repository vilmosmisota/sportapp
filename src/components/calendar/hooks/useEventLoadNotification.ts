import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { CalendarEvent } from "../EventCalendar";

/**
 * Hook that manages efficiently notifying parent components about event changes
 * Prevents unnecessary rerenders by only notifying when events or month actually change
 *
 * @param allEvents - Array of calendar events
 * @param isSuccess - Whether data fetching was successful
 * @param currentMonth - The current month being displayed
 * @param onEventsLoad - Callback to notify parent of events load
 */
export function useEventLoadNotification(
  allEvents: CalendarEvent[],
  isSuccess: boolean,
  currentMonth: Date,
  onEventsLoad?: (events: CalendarEvent[]) => void
): void {
  // Use refs to track previous values to avoid infinite loops
  const prevMonthRef = useRef<string>("");
  const prevEventsHashRef = useRef<string>("");

  useEffect(() => {
    // Only proceed if we have success, events, and a callback
    if (!isSuccess || allEvents.length === 0 || !onEventsLoad) return;

    // Create fingerprints for events and month
    const currentEventsHash = allEvents
      .map((e) => e.id)
      .sort()
      .join(",");
    const currentMonthKey = format(currentMonth, "yyyy-MM");

    // Check if we have meaningful changes
    const hasNewEvents = currentEventsHash !== prevEventsHashRef.current;
    const hasNewMonth = currentMonthKey !== prevMonthRef.current;

    if (hasNewEvents || hasNewMonth) {
      onEventsLoad(allEvents);

      // Update refs with current values
      prevEventsHashRef.current = currentEventsHash;
      prevMonthRef.current = currentMonthKey;
    }
  }, [isSuccess, allEvents, onEventsLoad, currentMonth]);
}
