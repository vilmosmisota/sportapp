import { cn } from "@/libs/tailwind/utils";
import { format } from "date-fns";
import { CalendarEvent } from "./EventCalendar";
import { defaultEventColors, gameStatusColors, formatEventTime } from "./utils";
import { Game, GameStatus } from "@/entities/game/Game.schema";
import { Training } from "@/entities/training/Training.schema";
import { CalendarClock, Dumbbell, Trophy, MapPin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Base EventItem props interface
export interface EventItemProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  variant?: "minimal" | "compact" | "full";
  className?: string;
}

// Shared function to get event colors
export function getEventColors(event: CalendarEvent) {
  if (event.type === "game") {
    const game = event.data as Game;
    return (
      gameStatusColors[game.status as GameStatus] || defaultEventColors.game
    );
  }

  if (event.color) {
    return {
      bg: `bg-${event.color}-100`,
      text: `text-${event.color}-800`,
      border: `border-${event.color}-300`,
    };
  }

  return defaultEventColors[event.type];
}

// Get location display text
export function getLocation(event: CalendarEvent) {
  if (event.type === "game") {
    const game = event.data as Game;
    return game.location?.name || "No location";
  } else {
    const training = event.data as Training;
    return training.location?.name || "No location";
  }
}

// Get event icon based on type
export function getEventIcon(eventType: string) {
  if (eventType === "training") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Dumbbell className="w-3.5 h-3.5 text-blue-600" strokeWidth={3} />
          </TooltipTrigger>
          <TooltipContent>
            <p>Training</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  } else if (eventType === "game") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Trophy className="w-3.5 h-3.5 text-amber-600" strokeWidth={3} />
          </TooltipTrigger>
          <TooltipContent>
            <p>Game</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return null;
}

// Calculate best text color based on background brightness
export function getBestTextColor(bgColor: string) {
  // Default to dark text if no background color
  if (!bgColor) return "#000000";

  // For hex colors, calculate brightness
  if (bgColor.match(/#[a-fA-F0-9]{6}$/)) {
    const r = parseInt(bgColor.substring(1, 3), 16);
    const g = parseInt(bgColor.substring(3, 5), 16);
    const b = parseInt(bgColor.substring(5, 7), 16);

    // Formula to determine brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150 ? "#000000" : "#FFFFFF";
  }

  return "#000000"; // Default to dark text
}

// Get training icon
export function getTrainingIcon(size: "small" | "medium" | "large" = "medium") {
  const sizeClasses = {
    small: "w-3 h-3",
    medium: "w-3.5 h-3.5",
    large: "w-4 h-4",
  };

  return (
    <Dumbbell
      className={`${sizeClasses[size]} text-blue-600 flex-shrink-0`}
      strokeWidth={3}
    />
  );
}

// Get game icon
export function getGameIcon(size: "small" | "medium" | "large" = "medium") {
  const sizeClasses = {
    small: "w-3 h-3",
    medium: "w-3.5 h-3.5",
    large: "w-4 h-4",
  };

  return (
    <Trophy
      className={`${sizeClasses[size]} text-amber-600 flex-shrink-0`}
      strokeWidth={3}
    />
  );
}

// Shared wrapper for minimal variant
export function MinimalEventWrapper({
  event,
  children,
  onClick,
  useCustomStyling,
  className,
  getCustomStyles,
}: {
  event: CalendarEvent;
  children: React.ReactNode;
  onClick?: (event: CalendarEvent) => void;
  useCustomStyling: boolean;
  className?: string;
  getCustomStyles: () => React.CSSProperties;
}) {
  const colors = getEventColors(event);

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-1 py-0.5 text-2xs rounded cursor-pointer truncate",
        // Only apply status colors if not using custom styling
        !useCustomStyling && colors.bg,
        !useCustomStyling && colors.text,
        className
      )}
      onClick={onClick ? () => onClick(event) : undefined}
      style={getCustomStyles()}
    >
      {children}
    </div>
  );
}

// Shared wrapper for compact variant
export function CompactEventWrapper({
  event,
  children,
  onClick,
  useCustomStyling,
  className,
  getCustomStyles,
}: {
  event: CalendarEvent;
  children: React.ReactNode;
  onClick?: (event: CalendarEvent) => void;
  useCustomStyling: boolean;
  className?: string;
  getCustomStyles: () => React.CSSProperties;
}) {
  const colors = getEventColors(event);

  return (
    <div
      className={cn(
        "rounded-md cursor-pointer truncate flex items-center border relative overflow-hidden",
        // Responsive padding and text size (mobile first)
        "px-1 py-0.5 text-2xs md:px-2 md:py-1 md:text-xs",
        // Only apply status colors if not using custom styling
        !useCustomStyling && colors.bg,
        !useCustomStyling && colors.text,
        !useCustomStyling && colors.border,
        className
      )}
      onClick={onClick ? () => onClick(event) : undefined}
      style={getCustomStyles()}
    >
      {children}
    </div>
  );
}

// Shared wrapper for full variant
export function FullEventWrapper({
  event,
  children,
  onClick,
  useCustomStyling,
  className,
  getCustomStyles,
}: {
  event: CalendarEvent;
  children: React.ReactNode;
  onClick?: (event: CalendarEvent) => void;
  useCustomStyling: boolean;
  className?: string;
  getCustomStyles: () => React.CSSProperties;
}) {
  const colors = getEventColors(event);

  return (
    <div
      className={cn(
        "rounded-md cursor-pointer border relative overflow-hidden",
        // Responsive padding (mobile first)
        "p-2 md:p-3",
        // Only apply status colors if not using custom styling
        !useCustomStyling && colors.bg,
        !useCustomStyling && colors.text,
        !useCustomStyling && colors.border,
        className
      )}
      onClick={onClick ? () => onClick(event) : undefined}
      style={getCustomStyles()}
    >
      {children}
    </div>
  );
}
