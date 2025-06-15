"use client";

import { cn } from "@/libs/tailwind/utils";
import { useCalendarNavigation } from "../hooks/useCalendarNavigation";
import { CalendarLoader } from "../loader";
import {
  CalendarConfig,
  CalendarEvent,
  CalendarSeason,
} from "../types/calendar.types";
import { CalendarEventHandlers } from "../types/event.types";
import { CalendarHeader } from "./CalendarHeader";
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
  const {
    navigation,
    goToDate,
    goToToday,
    changeView,
    goToPrevious,
    goToNext,
  } = useCalendarNavigation({
    defaultView: config.defaultView,
    onDateRangeChange,
    onViewChange,
  });

  const handleViewChange = (newView: "month" | "week" | "day") => {
    changeView(newView);
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
            onDateClick={onDateClick}
            onAddSession={onAddSession}
            className="flex-1"
          />
        );
      case "week":
        // TODO: Implement WeekView
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground">
              Week view coming soon...
            </div>
          </div>
        );
      case "day":
        // TODO: Implement DayView
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground">Day view coming soon...</div>
          </div>
        );
      default:
        return (
          <MonthView
            currentDate={navigation.currentDate}
            events={events}
            season={season}
            onEventClick={onEventClick}
            onEventDoubleClick={onEventDoubleClick}
            onDateClick={onDateClick}
            onAddSession={onAddSession}
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
