import { format } from "date-fns";
import { Game } from "@/entities/game/Game.schema";
import { MapPin, Trophy } from "lucide-react";
import { formatEventTime } from "./utils";
import {
  EventItemProps,
  MinimalEventWrapper,
  CompactEventWrapper,
  FullEventWrapper,
  getGameIcon,
  getEventIcon,
  getLocation,
  getBestTextColor,
} from "./event-item-utils";

interface GameEventItemProps extends EventItemProps {
  competitionColor?: string;
  useCustomStyling: boolean;
  getCustomStyles: () => React.CSSProperties;
}

export function GameEventItem({
  event,
  onClick,
  variant = "compact",
  className,
  competitionColor,
  useCustomStyling,
  getCustomStyles,
}: GameEventItemProps) {
  // Extract game data
  const gameData = event.data as any;
  const displayDetails = gameData?.displayDetails;
  const game = event.data as Game;

  // Get competition badge with styling
  const getCompetitionBadge = (useBadgeStyle = false) => {
    const competition = displayDetails?.competition;

    if (!competition?.name) return null;

    // When using badge style and competition color is available, apply color styling
    let style = {};
    if (useBadgeStyle && competitionColor) {
      style = {
        backgroundColor: competitionColor,
        color: getBestTextColor(competitionColor),
      };
    }

    // Use different styling based on variant and context
    if (variant === "minimal" && !useBadgeStyle) {
      return (
        <span
          className="ml-0.5 md:ml-1 text-xs px-0.5 py-0 md:px-1 md:py-0.5 rounded-sm truncate text-muted-foreground"
          style={style}
        >
          {competition.name}
        </span>
      );
    }

    // Use pill styling for badge mode, otherwise regular styling
    const shapeClass = useBadgeStyle ? "rounded-full" : "rounded-sm";

    return (
      <span
        className={`ml-0.5 md:ml-1 text-xs px-1 py-0 md:px-1.5 md:py-0.5 ${shapeClass} truncate ${
          !useBadgeStyle ? "text-muted-foreground" : "font-medium"
        }`}
        style={style}
      >
        {competition.name}
      </span>
    );
  };

  // Get opponent and tenant teams
  const getTeams = () => {
    if (!displayDetails) return { opponentTeam: null, tenantTeam: null };

    const { homeTeam, awayTeam } = displayDetails;
    // Always show opponent team first, tenant team second
    const opponentTeam = homeTeam.isHomeTeam ? awayTeam : homeTeam;
    const tenantTeam = homeTeam.isHomeTeam ? homeTeam : awayTeam;

    return { opponentTeam, tenantTeam };
  };

  // Helper to format game title
  const getGameTitle = () => {
    if (!displayDetails) return event.title;

    const { opponentTeam, tenantTeam } = getTeams();
    return `${opponentTeam.name} vs ${tenantTeam.name}`;
  };

  // Render team indicators for compact variant
  const renderTeamIndicators = () => {
    if (!displayDetails) return null;

    const { opponentTeam, tenantTeam } = getTeams();

    return (
      <div className="flex items-center gap-1">
        <div
          className="h-2 w-2 md:h-3 md:w-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: opponentTeam.color }}
        />
        <span className="text-xs">vs</span>
        <div
          className="h-2 w-2 md:h-3 md:w-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: tenantTeam.color }}
        />
      </div>
    );
  };

  // Minimal variant (for month view cells with limited space)
  if (variant === "minimal") {
    return (
      <MinimalEventWrapper
        event={event}
        onClick={onClick}
        useCustomStyling={useCustomStyling}
        className={className}
        getCustomStyles={getCustomStyles}
      >
        {/* Time */}
        <span className="font-semibold whitespace-nowrap text-xs">
          {format(event.start, "HH:mm")}
        </span>

        {/* Icon */}
        <span className="flex-shrink-0">{getGameIcon("small")}</span>

        {/* Content - all on one line */}
        <span className="truncate text-xs">{getGameTitle()}</span>

        {/* Competition badge */}
        {getCompetitionBadge()}
      </MinimalEventWrapper>
    );
  }

  // Compact variant (for month view when space allows)
  if (variant === "compact") {
    // Get opponent and tenant team names for smart truncation
    const { opponentTeam, tenantTeam } = getTeams();
    const hasTeams = opponentTeam && tenantTeam;

    return (
      <CompactEventWrapper
        event={event}
        onClick={onClick}
        useCustomStyling={useCustomStyling}
        className={className}
        getCustomStyles={getCustomStyles}
      >
        <div className="flex items-center gap-1 md:gap-2 w-full">
          {/* Time */}
          <span className="font-semibold whitespace-nowrap">
            {format(event.start, "HH:mm")}
          </span>

          {/* Icon */}
          <Trophy
            className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-600 flex-shrink-0"
            strokeWidth={3}
          />

          {/* Content - with team details in a single span */}
          {hasTeams ? (
            <span className="whitespace-nowrap truncate">
              {opponentTeam.name}
              {/* Hide details on small screens */}
              {opponentTeam.details && (
                <span className="text-2xs text-muted-foreground ml-0.5 md:ml-1 hidden md:inline">
                  {opponentTeam.details}
                </span>
              )}
              <span className="mx-0.5 md:mx-1">vs</span>
              {tenantTeam.name}
              {/* Hide details on small screens */}
              {tenantTeam.details && (
                <span className="text-2xs text-muted-foreground ml-0.5 md:ml-1 hidden md:inline">
                  {tenantTeam.details}
                </span>
              )}
            </span>
          ) : (
            <span className="truncate">{event.title}</span>
          )}
        </div>
      </CompactEventWrapper>
    );
  }

  // Full variant (for week and agenda views)
  return (
    <FullEventWrapper
      event={event}
      onClick={onClick}
      useCustomStyling={useCustomStyling}
      className={className}
      getCustomStyles={getCustomStyles}
    >
      {/* Header section with event type, time and competition type */}
      <div className="flex items-start justify-between mb-1 md:mb-2">
        {/* Left side with icon and time */}
        <div className="flex items-center gap-1 md:gap-2">
          <div className="flex items-center gap-1 md:gap-1.5">
            {getGameIcon("large")}
            <span className="font-medium text-2xs md:text-xs">
              {formatEventTime(event.start, event.end, event.type)}
            </span>
          </div>
        </div>

        {/* Right side with competition badge */}
        {getCompetitionBadge(true)}
      </div>

      {/* Teams section */}
      <div className="mb-2 md:mb-3">
        {!displayDetails ? (
          <div className="font-semibold text-sm md:text-base">
            {event.title}
          </div>
        ) : (
          (() => {
            const { homeTeam, awayTeam } = displayDetails;
            const hasScores =
              game.homeScore !== null && game.awayScore !== null;

            return (
              <div className="flex flex-col gap-1.5 md:gap-2.5">
                {/* Home team */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 md:gap-2">
                    <div
                      className="h-3 w-3 md:h-4 md:w-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: homeTeam.color }}
                    />
                    <div>
                      <div className="font-semibold text-xs md:text-sm">
                        {homeTeam.name}
                      </div>
                      {homeTeam.details && (
                        <div className="text-2xs md:text-xs text-muted-foreground">
                          {homeTeam.details}
                        </div>
                      )}
                    </div>
                  </div>
                  {hasScores && (
                    <div className="font-bold text-sm md:text-base">
                      {game.homeScore}
                    </div>
                  )}
                </div>

                {/* Versus divider */}
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-2xs md:text-xs font-medium text-muted-foreground">
                    vs
                  </span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* Away team */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 md:gap-2">
                    <div
                      className="h-3 w-3 md:h-4 md:w-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: awayTeam.color }}
                    />
                    <div>
                      <div className="font-semibold text-xs md:text-sm">
                        {awayTeam.name}
                      </div>
                      {awayTeam.details && (
                        <div className="text-2xs md:text-xs text-muted-foreground">
                          {awayTeam.details}
                        </div>
                      )}
                    </div>
                  </div>
                  {hasScores && (
                    <div className="font-bold text-sm md:text-base">
                      {game.awayScore}
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* Footer with location */}
      <div className="flex items-center gap-1 md:gap-1.5 text-muted-foreground">
        <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5" />
        <span className="text-2xs md:text-xs truncate">
          {getLocation(event)}
        </span>
      </div>
    </FullEventWrapper>
  );
}
