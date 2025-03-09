"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
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
} from "date-fns";
import { useMediaQuery } from "@/utils/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Game } from "@/entities/game/Game.schema";
import { Training } from "@/entities/training/Training.schema";
import { CalendarViewType } from "./types";
import { CalendarHeader } from "./CalendarHeader";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { AgendaView } from "./AgendaView";

export type CalendarEvent = {
  id: string | number;
  type: "game" | "training";
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  data: Game | Training;
};

interface EventCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateRangeChange?: (start: Date, end: Date) => void;
  defaultView?: CalendarViewType;
  isLoading?: boolean;
}

export function EventCalendar({
  events = [],
  onEventClick,
  onDateRangeChange,
  defaultView = "month",
  isLoading = false,
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
  const [dateRange, setDateRange] = useState({
    start:
      view === "month" ? startOfMonth(currentDate) : startOfWeek(currentDate),
    end: view === "month" ? endOfMonth(currentDate) : endOfWeek(currentDate),
  });

  // Calculate date range based on current view and date
  const calculateDateRange = useCallback(
    (date: Date, viewType: CalendarViewType) => {
      let start: Date, end: Date;

      if (viewType === "month") {
        start = startOfMonth(date);
        end = endOfMonth(date);
      } else if (viewType === "week") {
        start = startOfWeek(date);
        end = endOfWeek(date);
      } else {
        // For agenda view, show next 30 days by default
        start = startOfToday();
        end = new Date(start);
        end.setDate(start.getDate() + 30);
      }

      return { start, end };
    },
    []
  );

  // Update the date range and trigger the callback
  const updateDateRange = useCallback(
    (date: Date, viewType: CalendarViewType) => {
      const { start, end } = calculateDateRange(date, viewType);
      setDateRange({ start, end });

      // Only call the callback if it exists and the date range has changed
      if (
        onDateRangeChange &&
        (!dateRange.start ||
          !dateRange.end ||
          dateRange.start.getTime() !== start.getTime() ||
          dateRange.end.getTime() !== end.getTime())
      ) {
        onDateRangeChange(start, end);
      }
    },
    [calculateDateRange, onDateRangeChange, dateRange]
  );

  // Initialize date range on mount and when view changes
  useEffect(() => {
    const currentViewDate = view === "month" ? currentMonth : currentWeek;
    updateDateRange(currentViewDate, view);
    // We deliberately omit updateDateRange from dependencies to prevent cycles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentMonth, currentWeek]);

  // Navigate to today
  const handleToday = () => {
    const today = startOfToday();
    setCurrentDate(today);

    if (view === "month") {
      setCurrentMonth(startOfMonth(today));
    } else {
      setCurrentWeek(startOfWeek(today));
    }

    updateDateRange(today, view);
  };

  // Navigation functions
  const navigatePrevious = () => {
    if (view === "month") {
      setCurrentDate((prevDate) => subMonths(prevDate, 1));
    } else if (view === "week") {
      setCurrentDate((prevDate) => subWeeks(prevDate, 1));
    } else {
      setCurrentDate((prevDate) => subWeeks(prevDate, 2));
    }
  };

  const navigateNext = () => {
    if (view === "month") {
      setCurrentDate((prevDate) => addMonths(prevDate, 1));
    } else if (view === "week") {
      setCurrentDate((prevDate) => addWeeks(prevDate, 1));
    } else {
      setCurrentDate((prevDate) => addWeeks(prevDate, 2));
    }
  };

  // Month view navigation
  const handlePreviousMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);
    setCurrentMonth(prevMonth);
    updateDateRange(prevMonth, "month");
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    setCurrentMonth(nextMonth);
    updateDateRange(nextMonth, "month");
  };

  // Week view navigation
  const handlePreviousWeek = () => {
    const prevWeek = subWeeks(currentWeek, 1);
    setCurrentWeek(prevWeek);
    updateDateRange(prevWeek, "week");
  };

  const handleNextWeek = () => {
    const nextWeek = addWeeks(currentWeek, 1);
    setCurrentWeek(nextWeek);
    updateDateRange(nextWeek, "week");
  };

  const formatTitle = () => {
    const monthFormat = "MMMM yyyy";
    const weekFormat = "MMM d";

    switch (view) {
      case "month":
        return format(currentMonth, monthFormat);
      case "week":
        const start = startOfWeek(currentWeek);
        const end = endOfWeek(currentWeek);
        const startMonth = format(start, "MMM");
        const endMonth = format(end, "MMM");
        const startDay = format(start, "d");
        const endDay = format(end, "d");
        const year = format(end, "yyyy");

        return `${
          startMonth !== endMonth
            ? `${startMonth} ${startDay} - ${endMonth} ${endDay}`
            : `${startMonth} ${startDay} - ${endDay}`
        }, ${year}`;
      case "day":
        return "Upcoming Events";
      default:
        return "";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <CalendarHeader
        title={formatTitle()}
        onPrevious={view === "month" ? handlePreviousMonth : handlePreviousWeek}
        onNext={view === "month" ? handleNextMonth : handleNextWeek}
        onToday={handleToday}
        // Replace with total unfiltered count in real app
      />

      <Tabs
        value={view}
        onValueChange={(newView) => setView(newView as CalendarViewType)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="mt-2">
          <AgendaView
            currentDate={currentDate}
            events={events}
            onEventClick={onEventClick}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="week" className="mt-2">
          <WeekView
            currentDate={currentDate}
            events={events}
            onEventClick={onEventClick}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="month" className="mt-2">
          <MonthView
            currentDate={currentDate}
            events={events}
            onEventClick={onEventClick}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
