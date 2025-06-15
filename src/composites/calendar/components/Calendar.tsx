"use client";

import { cn } from "@/libs/tailwind/utils";
import { useState } from "react";
import { useCalendarNavigation } from "../hooks/useCalendarNavigation";
import { CalendarLoader } from "../loader";
import {
  CalendarConfig,
  CalendarEvent,
  CalendarSeason,
  CalendarView,
} from "../types/calendar.types";
import { CalendarEventHandlers } from "../types/event.types";
import { CalendarHeader } from "./CalendarHeader";
import { DayView } from "./views/DayView";
import { MonthView } from "./views/MonthView";

interface CalendarProps<TEvent extends CalendarEvent>
  extends CalendarEventHandlers<TEvent> {
  events: TEvent[];
  config: CalendarConfig<TEvent>;
  season?: CalendarSeason;
  isLoading?: boolean;
  className?: string;
}

export function Calendar<TEvent extends CalendarEvent>({
  events,
  config,
  season,
  isLoading = false,
  className,
  onEventClick,
  onEventDoubleClick,
  onDateClick,
  onDateRangeChange,
  onViewChange,
  onAddSession,
}: CalendarProps<TEvent>) {
  // Track selected date across view changes
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const {
    navigation,
    goToDate,
    goToToday,
    changeView,
    goToPrevious,
    goToNext,
    goToDateAndView,
  } = useCalendarNavigation({
    defaultView: config.defaultView,
    onDateRangeChange,
    onViewChange,
  });

  const handleViewChange = (newView: CalendarView) => {
    changeView(newView);
  };

  // Handler for navigating to a specific date in day view
  const handleGoToDateInDayView = (date: Date) => {
    setSelectedDate(date); // Set selected date
    goToDateAndView(date, "day");
  };

  // Handle date click with maintaining selected state
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const renderCurrentView = () => {
    if (isLoading) {
      return <CalendarLoader className="border-0 rounded-none" />;
    }

    switch (navigation.view) {
      case "month":
        return (
          <MonthView
            currentDate={navigation.currentDate}
            events={events}
            season={season}
            onEventClick={onEventClick}
            onEventDoubleClick={onEventDoubleClick}
            onDateClick={handleDateClick}
            onAddSession={onAddSession}
            onDayNumberClick={handleGoToDateInDayView}
            selectedDate={selectedDate}
            className="flex-1"
          />
        );
      case "day":
        return (
          <DayView
            currentDate={navigation.currentDate}
            events={events}
            season={season}
            onEventClick={onEventClick}
            onEventDoubleClick={onEventDoubleClick}
            onDateClick={handleDateClick}
            onAddSession={onAddSession}
            onDateChange={(date) => {
              setSelectedDate(date);
              goToDate(date);
            }}
            selectedDate={selectedDate}
            className="flex-1"
          />
        );
      // Week view will be implemented later
      default:
        return (
          <MonthView
            currentDate={navigation.currentDate}
            events={events}
            season={season}
            onEventClick={onEventClick}
            onEventDoubleClick={onEventDoubleClick}
            onDateClick={handleDateClick}
            onAddSession={onAddSession}
            onDayNumberClick={handleGoToDateInDayView}
            selectedDate={selectedDate}
            className="flex-1"
          />
        );
    }
  };

  // If loading, return the full calendar loader
  if (isLoading) {
    return <CalendarLoader className={className} />;
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card border border-border rounded-lg shadow-sm",
        className
      )}
    >
      <CalendarHeader
        navigation={navigation}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onToday={goToToday}
        onViewChange={
          config.features.viewSwitching ? handleViewChange : undefined
        }
        showViewSwitcher={config.features.viewSwitching}
      />
      {renderCurrentView()}
    </div>
  );
}
