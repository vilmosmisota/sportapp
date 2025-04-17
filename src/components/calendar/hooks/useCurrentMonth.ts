import { useState, useCallback, useEffect } from "react";
import { startOfMonth } from "date-fns";

/**
 * Custom hook to manage current month state with optional external control
 *
 * @param propCurrentMonth - Optional externally controlled month date
 * @param onMonthChange - Optional callback when month changes
 * @returns Object containing current month and update function
 */
export function useCurrentMonth(
  propCurrentMonth?: Date,
  onMonthChange?: (date: Date) => void
) {
  const [internalCurrentMonth, setInternalCurrentMonth] = useState<Date>(
    propCurrentMonth || startOfMonth(new Date())
  );

  // Use prop currentMonth if provided, otherwise use internal state
  const currentMonth = propCurrentMonth || internalCurrentMonth;

  // Update internal state when prop changes
  useEffect(() => {
    if (propCurrentMonth) {
      setInternalCurrentMonth(propCurrentMonth);
    }
  }, [propCurrentMonth]);

  // Handle setting the month with callback if provided
  const updateCurrentMonth = useCallback(
    (newMonth: Date) => {
      if (onMonthChange) {
        onMonthChange(newMonth);
      } else {
        setInternalCurrentMonth(newMonth);
      }
    },
    [onMonthChange]
  );

  return {
    currentMonth,
    updateCurrentMonth,
  };
}
