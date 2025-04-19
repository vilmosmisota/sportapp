"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  format,
  startOfToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  startOfDay,
} from "date-fns";
import { useMediaQuery } from "@/utils/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Game } from "@/entities/game/Game.schema";
import { Training } from "@/entities/training/Training.schema";
import { CalendarViewType } from "./types";
import { CalendarHeader } from "./CalendarHeader";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { Season } from "@/entities/season/Season.schema";

export type CalendarEvent = {
  id: string | number;
  type: "game" | "training";
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  data: (Game | Training) & {
    displayDetails?: {
      homeTeam?: { name: string; color: string; details: string };
      awayTeam?: { name: string; color: string; details: string };
      competition?: { name: string; color: string };
      detailsText?: string;
    };
  };
};

interface EventCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateRangeChange?: (start: Date, end: Date) => void;
  defaultView?: CalendarViewType;
  isLoading?: boolean;
  seasonBreaks?: { from: Date; to: Date }[];
  seasonDateRange?: { startDate: Date; endDate: Date } | null;
  onDayContextMenu?: (date: Date, event: React.MouseEvent) => void;
}

export function EventCalendar({
  events = [],
  onEventClick,
  onDateRangeChange,
  defaultView = "month",
  isLoading = false,
  seasonBreaks = [],
  seasonDateRange = null,
  onDayContextMenu,
}: EventCalendarProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [view, setView] = useState<CalendarViewType>(defaultView);
  const [currentDate, setCurrentDate] = useState<Date>(startOfToday());
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(currentDate)
  );
  const [currentWeek, setCurrentWeek] = useState<Date>(
    startOfWeek(currentDate)
  );

  // Calculate date range based on current view and date
  const calculateDateRange = useCallback(
    (date: Date, viewType: CalendarViewType) => {
      let start: Date, end: Date;

      if (viewType === "month") {
        start = startOfMonth(date);
        end = endOfMonth(date);
      } else {
        // day view
        start = startOfDay(date);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
      }

      return { start, end };
    },
    []
  );

  // Compute the current date range during rendering based on view and current date
  const currentViewDate = view === "month" ? currentMonth : currentWeek;
  const computedDateRange = calculateDateRange(currentViewDate, view);

  // Store the computed date range to check for changes
  const prevDateRangeRef = useRef(computedDateRange);

  // We need a useEffect for handling notification to parent component
  // This specifically focuses on tracking month changes for data fetching
  useEffect(() => {
    // Extract month from current date range
    const currentViewMonth = startOfMonth(computedDateRange.start);

    // Extract month from previous date range (if any)
    const prevViewMonth = prevDateRangeRef.current
      ? startOfMonth(prevDateRangeRef.current.start)
      : null;

    // Only notify when month changes or on first render
    if (
      !prevViewMonth ||
      currentViewMonth.getTime() !== prevViewMonth.getTime()
    ) {
      if (onDateRangeChange) {
        // Always notify with full month boundaries
        const monthStart = startOfMonth(currentViewMonth);
        const monthEnd = endOfMonth(currentViewMonth);

        onDateRangeChange(monthStart, monthEnd);
      }
    }

    // Always update the ref with current range to track changes
    prevDateRangeRef.current = computedDateRange;
  }, [computedDateRange, onDateRangeChange]);

  // Navigate to today
  const handleToday = () => {
    const today = startOfToday();
    setCurrentDate(today);

    if (view === "month") {
      setCurrentMonth(startOfMonth(today));
    }
  };

  // Month view navigation
  const handlePreviousMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);
    setCurrentMonth(prevMonth);
    setCurrentDate(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    setCurrentMonth(nextMonth);
    setCurrentDate(nextMonth);
  };

  // Day view navigation
  const handleDayChange = (date: Date) => {
    setCurrentDate(date);
    if (onDateRangeChange) {
      // For day view, use the start and end of the day as the range
      const start = startOfDay(date);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      onDateRangeChange(start, end);
    }
  };

  // Handle date click from month view to switch to day view
  const handleDateClick = useCallback(
    (date: Date) => {
      setCurrentDate(date);
      setView("day");

      if (onDateRangeChange) {
        // For day view, use the start and end of the day as the range
        const start = startOfDay(date);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        onDateRangeChange(start, end);
      }
    },
    [onDateRangeChange]
  );

  const formatTitle = () => {
    switch (view) {
      case "month":
        return format(currentMonth, "MMMM yyyy");
      case "day":
        return format(currentDate, "MMMM yyyy");
      default:
        return "";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-5 pb-2">
        <CalendarHeader
          title={formatTitle()}
          onPrevious={handlePreviousMonth}
          onNext={handleNextMonth}
          onToday={handleToday}
        />

        <Tabs
          value={view}
          onValueChange={(newView) => setView(newView as CalendarViewType)}
          className="w-auto"
        >
          <TabsList className="grid grid-cols-2 w-auto h-8 px-1">
            <TabsTrigger value="day" className="px-3 text-xs rounded-sm">
              Day
            </TabsTrigger>
            <TabsTrigger value="month" className="px-3 text-xs rounded-sm">
              Month
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs
        value={view}
        onValueChange={(newView) => setView(newView as CalendarViewType)}
        className="flex-grow h-[calc(100%-52px)]"
      >
        <TabsContent
          value="day"
          className="h-full m-0 mt-0 p-0 data-[state=active]:block"
        >
          <DayView
            currentDate={currentDate}
            events={events}
            onEventClick={onEventClick}
            isLoading={isLoading}
            seasonBreaks={seasonBreaks}
            seasonDateRange={seasonDateRange}
            onDateChange={handleDayChange}
          />
        </TabsContent>

        <TabsContent
          value="month"
          className="h-full m-0 mt-0 p-0 data-[state=active]:block"
        >
          <MonthView
            currentDate={currentMonth}
            events={events}
            onEventClick={onEventClick}
            onDateClick={handleDateClick}
            isLoading={isLoading}
            seasonBreaks={seasonBreaks}
            seasonDateRange={seasonDateRange}
            onDayContextMenu={onDayContextMenu}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
