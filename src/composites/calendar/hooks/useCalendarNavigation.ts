import { startOfToday } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import {
  CalendarNavigation,
  CalendarView,
  DateRange,
} from "../types/calendar.types";
import {
  getDayDateRange,
  getMonthDateRange,
  getWeekDateRange,
} from "../utils/date.utils";

interface UseCalendarNavigationProps {
  defaultView?: CalendarView;
  defaultDate?: Date;
  onDateRangeChange?: (dateRange: DateRange) => void;
  onViewChange?: (view: CalendarView) => void;
}

export function useCalendarNavigation({
  defaultView = "month",
  defaultDate = startOfToday(),
  onDateRangeChange,
  onViewChange,
}: UseCalendarNavigationProps = {}) {
  const [currentDate, setCurrentDate] = useState<Date>(defaultDate);
  const [view, setView] = useState<CalendarView>(defaultView);

  // Calculate date range based on current view and date
  const dateRange = useMemo((): DateRange => {
    switch (view) {
      case "month":
        return getMonthDateRange(currentDate);
      case "week":
        return getWeekDateRange(currentDate);
      case "day":
        return getDayDateRange(currentDate);
      default:
        return getMonthDateRange(currentDate);
    }
  }, [currentDate, view]);

  // Navigation state object
  const navigation: CalendarNavigation = useMemo(
    () => ({
      currentDate,
      view,
      dateRange,
    }),
    [currentDate, view, dateRange]
  );

  // Navigation functions
  const goToDate = useCallback(
    (date: Date) => {
      setCurrentDate(date);
      if (onDateRangeChange) {
        const newDateRange =
          view === "month"
            ? getMonthDateRange(date)
            : view === "week"
            ? getWeekDateRange(date)
            : getDayDateRange(date);
        onDateRangeChange(newDateRange);
      }
    },
    [view, onDateRangeChange]
  );

  const goToToday = useCallback(() => {
    const today = startOfToday();
    goToDate(today);
  }, [goToDate]);

  const changeView = useCallback(
    (newView: CalendarView) => {
      setView(newView);
      if (onViewChange) {
        onViewChange(newView);
      }
      if (onDateRangeChange) {
        const newDateRange =
          newView === "month"
            ? getMonthDateRange(currentDate)
            : newView === "week"
            ? getWeekDateRange(currentDate)
            : getDayDateRange(currentDate);
        onDateRangeChange(newDateRange);
      }
    },
    [currentDate, onDateRangeChange, onViewChange]
  );

  const goToPrevious = useCallback(() => {
    const newDate = new Date(currentDate);
    switch (view) {
      case "month":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() - 7);
        break;
      case "day":
        newDate.setDate(newDate.getDate() - 1);
        break;
    }
    goToDate(newDate);
  }, [currentDate, view, goToDate]);

  const goToNext = useCallback(() => {
    const newDate = new Date(currentDate);
    switch (view) {
      case "month":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() + 7);
        break;
      case "day":
        newDate.setDate(newDate.getDate() + 1);
        break;
    }
    goToDate(newDate);
  }, [currentDate, view, goToDate]);

  return {
    navigation,
    goToDate,
    goToToday,
    changeView,
    goToPrevious,
    goToNext,
  };
}
