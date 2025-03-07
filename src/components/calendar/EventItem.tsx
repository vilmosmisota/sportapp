"use client";

import { cn } from "@/libs/tailwind/utils";
import { format } from "date-fns";
import { CalendarEvent } from "./EventCalendar";
import { defaultEventColors, gameStatusColors, formatEventTime } from "./utils";
import { Game, GameStatus } from "@/entities/game/Game.schema";
import { Training } from "@/entities/training/Training.schema";
import { CalendarClock, Users } from "lucide-react";

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

  // Handle click
  const handleClick = () => {
    if (onClick) onClick(event);
  };

  // Get team names for game events
  const getGameTeams = () => {
    if (event.type !== "game") return null;

    const game = event.data as Game;
    const home = game.homeTeam?.name || "Unknown Team";
    const away = game.awayTeam?.name || "Unknown Team";

    return { home, away };
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

  // Minimal variant (just a dot for month view)
  if (variant === "minimal") {
    return (
      <div
        className={cn("h-2 w-2 rounded-full", colors.bg, className)}
        onClick={handleClick}
      />
    );
  }

  // Compact variant (for month view when space allows)
  if (variant === "compact") {
    const teams = getGameTeams();

    return (
      <div
        className={cn(
          "px-2 py-1 rounded-md text-xs cursor-pointer truncate flex items-center border",
          colors.bg,
          colors.text,
          colors.border,
          className
        )}
        onClick={handleClick}
      >
        {event.type === "game" && teams ? (
          <div className="flex items-center justify-between w-full">
            <span className="font-semibold truncate">
              {teams.home} vs {teams.away}
            </span>
            <span className="ml-1 whitespace-nowrap">
              {format(event.start, "HH:mm")}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              {event.type === "training" && <Users className="w-3 h-3" />}
              <span className="font-semibold truncate">{event.title}</span>
            </div>
            <span className="ml-1 whitespace-nowrap">
              {format(event.start, "HH:mm")}
            </span>
          </div>
        )}
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
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold">{event.title}</div>
          {event.type === "game" && getGameTeams() && (
            <div className="text-sm">
              {getGameTeams()?.home} vs {getGameTeams()?.away}
            </div>
          )}
        </div>
        {event.type === "game" && getStatusBadge()}
      </div>

      <div className="mt-1 text-sm flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <CalendarClock className="w-3.5 h-3.5" />
          <span>{formatEventTime(event.start, event.end)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm">{getLocation()}</span>
        </div>
      </div>
    </div>
  );
}
