"use client";

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

interface EventItemProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  variant?: "minimal" | "compact" | "full";
  className?: string;
}

export function EventItem({
  event,
  onClick,
  variant = "compact",
  className,
}: EventItemProps) {
  // Get appropriate colors based on event type and status
  const getEventColors = () => {
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
  };

  const colors = getEventColors();

  // Get team color for training cards
  const getTeamColor = () => {
    if (event.type === "training") {
      const training = event.data as Training;
      return training.team?.appearance?.color || undefined;
    }
    return undefined;
  };

  const teamColor = getTeamColor();

  // Get custom styles based on team color
  const getCustomStyles = () => {
    if (!teamColor) return {};

    if (event.type === "training") {
      return {
        borderLeftWidth: variant === "minimal" ? "2px" : "4px",
        borderLeftColor: teamColor,
        backgroundColor: `${teamColor}10`, // Add 15% opacity version of the color
        paddingLeft: variant === "minimal" ? "2px" : undefined,
      };
    }

    return {};
  };

  // Handle click
  const handleClick = () => {
    if (onClick) onClick(event);
  };

  // Format location (used in full variant)
  const getLocation = () => {
    if (event.type === "game") {
      const game = event.data as Game;
      return game.location?.name || "No location";
    } else {
      const training = event.data as Training;
      return training.location?.name || "No location";
    }
  };

  // Get status badge for games
  const getStatusBadge = () => {
    if (event.type !== "game") return null;

    const game = event.data as Game;
    return (
      <span
        className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
      >
        {game.status}
      </span>
    );
  };

  // Get event icon based on type
  const getEventIcon = () => {
    if (event.type === "training") {
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
    } else if (event.type === "game") {
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
  };

  // Minimal variant (for month view cells with limited space)
  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "flex items-center gap-1 px-1 py-0.5 text-2xs rounded cursor-pointer truncate",
          colors.bg,
          colors.text,
          className
        )}
        onClick={handleClick}
        style={getCustomStyles()}
      >
        <span className="font-semibold whitespace-nowrap">
          {format(event.start, "HH:mm")}
        </span>
        {getEventIcon()}
        <span className="truncate">{event.title}</span>
      </div>
    );
  }

  // Compact variant (for month view when space allows)
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "px-2 py-1 rounded-md text-xs cursor-pointer truncate flex items-center border",
          colors.bg,
          colors.text,
          colors.border,
          className,
          "relative overflow-hidden"
        )}
        onClick={handleClick}
        style={getCustomStyles()}
      >
        <div className="flex items-center gap-2 w-full">
          <span className="font-semibold whitespace-nowrap">
            {format(event.start, "HH:mm")}
          </span>
          {getEventIcon()}
          <span className="truncate">{event.title}</span>
        </div>
      </div>
    );
  }

  // Full variant (for week and agenda views)
  return (
    <div
      className={cn(
        "p-2 rounded-md cursor-pointer border",
        colors.bg,
        colors.text,
        colors.border,
        className,
        "relative overflow-hidden"
      )}
      onClick={handleClick}
      style={getCustomStyles()}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1">
            {getEventIcon()}
            <span className="font-semibold">{event.title}</span>
          </div>
        </div>
        {event.type === "game" && getStatusBadge()}
      </div>

      <div className="mt-1 text-sm flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <CalendarClock className="w-3.5 h-3.5" />
          <span>{formatEventTime(event.start, event.end)}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-sm">{getLocation()}</span>
        </div>
      </div>
    </div>
  );
}
