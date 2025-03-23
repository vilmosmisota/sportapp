"use client";

import { CalendarEvent } from "./EventCalendar";
import { Game } from "@/entities/game/Game.schema";
import { Training } from "@/entities/training/Training.schema";
import { GameEventItem } from "./GameEventItem";
import { TrainingEventItem } from "./TrainingEventItem";
import { EventItemProps } from "./event-item-utils";

export function EventItem(props: EventItemProps) {
  const { event, onClick, variant = "compact", className } = props;

  // Get team color for training cards
  const getTeamColor = () => {
    if (event.type === "training") {
      const training = event.data as Training;
      return training.team?.appearance?.color || undefined;
    }
    return undefined;
  };

  const teamColor = getTeamColor();

  // Get competition color for game cards
  const getCompetitionColor = () => {
    if (event.type === "game") {
      const gameData = event.data as any;
      const competition = gameData.displayDetails?.competition;
      return competition?.color || undefined;
    }
    return undefined;
  };

  const competitionColor = getCompetitionColor();

  // Get custom styles based on team/competition color
  const getCustomStyles = () => {
    // For training events, use team color
    if (teamColor && event.type === "training") {
      return {
        borderLeftWidth: variant === "minimal" ? "2px" : "4px",
        borderLeftColor: teamColor,
        backgroundColor: `${teamColor}10`, // Add 10% opacity version of the color
        paddingLeft: variant === "minimal" ? "2px" : undefined,
      };
    }

    // For game events, use competition color
    if (competitionColor && event.type === "game") {
      return {
        borderLeftWidth: variant === "minimal" ? "2px" : "4px",
        borderLeftColor: competitionColor,
        backgroundColor: `${competitionColor}10`, // Add 10% opacity version of the color
        paddingLeft: variant === "minimal" ? "2px" : undefined,
      };
    }

    return {};
  };

  // Determine if we should use custom styling for this event
  const useCustomStyling =
    (teamColor && event.type === "training") ||
    (competitionColor && event.type === "game");

  // Render the appropriate component based on event type
  if (event.type === "game") {
    return (
      <GameEventItem
        event={event}
        onClick={onClick}
        variant={variant}
        className={className}
        competitionColor={competitionColor}
        useCustomStyling={useCustomStyling}
        getCustomStyles={getCustomStyles}
      />
    );
  } else if (event.type === "training") {
    return (
      <TrainingEventItem
        event={event}
        onClick={onClick}
        variant={variant}
        className={className}
        teamColor={teamColor}
        useCustomStyling={useCustomStyling}
        getCustomStyles={getCustomStyles}
      />
    );
  }

  // For any other event types, render a simple version
  return (
    <div
      className="px-2 py-1 rounded-md cursor-pointer truncate border"
      onClick={onClick ? () => onClick(event) : undefined}
      data-event-id={event.id}
      data-event-type={event.type}
    >
      <span className="font-medium">{event.title}</span>
    </div>
  );
}
