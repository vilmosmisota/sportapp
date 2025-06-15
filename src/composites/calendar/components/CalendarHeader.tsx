"use client";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarNavigation, CalendarView } from "../types/calendar.types";

interface CalendarHeaderProps {
  navigation: CalendarNavigation;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange?: (view: CalendarView) => void;
  showViewSwitcher?: boolean;
}

export function CalendarHeader({
  navigation,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
  showViewSwitcher = true,
}: CalendarHeaderProps) {
  const { currentDate, view } = navigation;

  // Format title based on current view
  const getTitle = () => {
    switch (view) {
      case "month":
        return format(currentDate, "MMMM yyyy");
      case "week":
        return format(currentDate, "MMM dd, yyyy");
      case "day":
        return format(currentDate, "EEEE, MMM dd, yyyy");
      default:
        return format(currentDate, "MMMM yyyy");
    }
  };

  const views: { value: CalendarView; label: string }[] = [
    { value: "month", label: "Month" },
    // { value: "week", label: "Week" }, // Temporarily hidden
    { value: "day", label: "Day" },
  ];

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
      {/* Left side - Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          className="h-8 w-8 p-0 hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          className="h-8 w-8 p-0 hover:bg-accent"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="ml-2 hover:bg-accent"
        >
          Today
        </Button>
      </div>

      {/* Center - Title */}
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">{getTitle()}</h2>
      </div>

      {/* Right side - View switcher */}
      {showViewSwitcher && onViewChange && (
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border">
          {views.map((viewOption) => (
            <Button
              key={viewOption.value}
              variant={view === viewOption.value ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange(viewOption.value)}
              className="h-7 px-3 text-xs"
            >
              {viewOption.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
