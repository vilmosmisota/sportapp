"use client";

import { cn } from "@/libs/tailwind/utils";
import { CheckCircle2 } from "lucide-react";
import { CalendarEvent } from "../types/calendar.types";
import { formatTime } from "../utils/date.utils";

interface EventRendererProps<TEvent extends CalendarEvent> {
  event: TEvent;
  variant?: "minimal" | "compact" | "full";
  onClick?: (event: TEvent) => void;
  onDoubleClick?: (event: TEvent) => void;
  className?: string;
  useDialogProvider?: boolean;
}

export function EventRenderer<TEvent extends CalendarEvent>({
  event,
  variant = "compact",
  onClick,
  onDoubleClick,
  className,
  useDialogProvider = false,
}: EventRendererProps<TEvent>) {
  const handleClick = () => {
    if (onClick) {
      onClick(event);
    }
  };

  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick(event);
    }
  };

  // Check if event has isAggregated property (for session events)
  const isAggregated = event.data?.isAggregated || false;

  // Get event styling using CSS custom properties
  const getEventStyles = () => {
    const color = event.metadata?.color;

    if (color) {
      return {
        borderLeftColor: color,
        backgroundColor: `${color}15`, // 15% opacity
        color: "hsl(var(--foreground))",
      };
    }

    // Default to primary color scheme
    return {
      borderLeftColor: "hsl(var(--primary))",
      backgroundColor: "hsl(var(--primary) / 0.1)",
      color: "hsl(var(--foreground))",
    };
  };

  // Base classes for all variants
  const baseClasses = cn(
    "cursor-pointer rounded-md border-l-4 transition-colors",
    "hover:bg-opacity-20 active:bg-opacity-30",
    "hover:shadow-md hover:translate-y-[-1px] transition-all duration-150",
    className
  );

  // Minimal variant (for dense month views)
  if (variant === "minimal") {
    return (
      <div
        className={cn(baseClasses, "px-1 py-0.5 text-xs")}
        style={getEventStyles()}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        title={event.metadata?.description || event.title}
      >
        <div className="flex items-center gap-1 relative">
          <span className="font-medium text-xs truncate">
            {formatTime(event.startDate)}
          </span>
          <span className="truncate">{event.title}</span>
          {isAggregated && (
            <CheckCircle2
              className="w-3 h-3 text-green-600 flex-shrink-0 absolute right-0 top-1/2 -translate-y-1/2"
              strokeWidth={2}
            />
          )}
        </div>
      </div>
    );
  }

  // Compact variant (for month view with more space)
  if (variant === "compact") {
    return (
      <div
        className={cn(baseClasses, "px-2 py-1 text-sm")}
        style={getEventStyles()}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        title={event.metadata?.description || event.title}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs whitespace-nowrap">
            {formatTime(event.startDate)}
          </span>
          <span className="truncate">{event.title}</span>
          {isAggregated && (
            <div className="flex items-center ml-auto">
              <CheckCircle2
                className="w-3 h-3 text-green-600 flex-shrink-0"
                strokeWidth={2.5}
              />
              <span className="text-xs text-green-600 font-medium ml-0.5 hidden sm:inline">
                Agg
              </span>
            </div>
          )}
        </div>
        {event.metadata?.description && (
          <div className="text-xs text-muted-foreground mt-0.5 truncate">
            {event.metadata.description}
          </div>
        )}
      </div>
    );
  }

  // Full variant (for day/week views with lots of space)
  return (
    <div
      className={cn(baseClasses, "px-3 py-2")}
      style={getEventStyles()}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{event.title}</div>
          <div className="text-xs text-muted-foreground">
            {formatTime(event.startDate)} - {formatTime(event.endDate)}
          </div>
          {event.metadata?.description && (
            <div className="text-xs text-muted-foreground mt-1">
              {event.metadata.description}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          {event.metadata?.category && (
            <div className="text-xs bg-card border border-border px-1.5 py-0.5 rounded">
              {event.metadata.category}
            </div>
          )}
          {isAggregated && (
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
              <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
              <span className="font-medium hidden sm:inline">Aggregated</span>
              <span className="font-medium sm:hidden">Agg</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
