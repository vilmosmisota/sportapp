import React from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Trophy,
  Users,
  ClipboardList,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { CalendarEvent } from "./EventCalendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/libs/tailwind/utils";
import { defaultEventColors, gameStatusColors } from "./utils";
import { getTrainingIcon, getGameIcon } from "./event-item-utils";
import {
  TeamGroup,
  TeamAppearance,
  Team,
  Competition,
  Location,
  GameDisplayDetails,
  GameData,
  TrainingData,
  isGameEvent,
  isTrainingEvent,
} from "./types";

interface CalendarEventCardProps {
  event: CalendarEvent;
  onEventClick?: (event: CalendarEvent) => void;
}

// Helper function to format age display
function formatAgeDisplay(age: string | null | undefined): string {
  if (!age) return "All ages";

  // If the age contains a hash, extract just the first part (e.g., "U12#0-12" -> "U12")
  const parts = age.split("#");
  if (parts.length > 1) {
    return parts[0];
  }

  return age;
}

// Helper function to format gender display
function formatGenderDisplay(gender: string | null | undefined): string {
  if (!gender) return "";

  // Convert "Female" to "Girls" and "Male" to "Boys"
  if (gender.toLowerCase() === "female") return "Girls";
  if (gender.toLowerCase() === "male") return "Boys";

  return gender;
}

export function CalendarEventCard({
  event,
  onEventClick,
}: CalendarEventCardProps) {
  // Use properly typed data with type guards
  const eventData = isGameEvent(event)
    ? (event.data as GameData)
    : isTrainingEvent(event)
    ? (event.data as TrainingData)
    : event.data;

  console.log("eventData", eventData);

  // Get team color for training cards
  const getTeamColor = () => {
    if (
      isTrainingEvent(event) &&
      (eventData as TrainingData)?.team?.appearance?.color
    ) {
      return (eventData as TrainingData).team!.appearance!.color;
    }
    return undefined;
  };

  const teamColor = getTeamColor();

  // Get competition color for game cards
  const getCompetitionColor = () => {
    if (
      isGameEvent(event) &&
      (eventData as GameData)?.displayDetails?.competition?.color
    ) {
      return (eventData as GameData).displayDetails!.competition!.color;
    }
    return undefined;
  };

  const competitionColor = getCompetitionColor();

  // Determine the base color to use
  const eventColorKey = event.type as keyof typeof defaultEventColors;
  const eventColor =
    event.color ||
    (isTrainingEvent(event) && teamColor) ||
    (isGameEvent(event) && competitionColor) ||
    defaultEventColors[eventColorKey] ||
    defaultEventColors.default;

  // Get appropriate color based on event type
  const getHeaderStyle = () => {
    if (isTrainingEvent(event) && teamColor) {
      return {
        backgroundColor: `${teamColor}10`,
        borderBottom: `1px solid ${teamColor}30`,
      };
    }

    if (isGameEvent(event) && competitionColor) {
      return {
        backgroundColor: `${competitionColor}10`,
        borderBottom: `1px solid ${competitionColor}30`,
      };
    }

    return {
      backgroundColor: `var(--${eventColor}-50)`,
      borderBottom: `1px solid var(--${eventColor}-100)`,
    };
  };

  const getEventTypeIcon = () => {
    if (isGameEvent(event)) {
      return getGameIcon("large");
    } else if (isTrainingEvent(event)) {
      return getTrainingIcon("large");
    } else {
      return (
        <CalendarIcon
          className="h-5 w-5"
          style={{ color: `var(--${eventColor}-500)` }}
        />
      );
    }
  };

  // Check if the event has notes
  const hasNotes = isGameEvent(event)
    ? !!(eventData as GameData)?.meta?.note
    : isTrainingEvent(event)
    ? !!(eventData as TrainingData)?.meta?.note
    : false;

  // For game data-specific access
  const gameData = isGameEvent(event) ? (eventData as GameData) : null;
  // For training data-specific access
  const trainingData = isTrainingEvent(event)
    ? (eventData as TrainingData)
    : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 mx-0 px-4" style={getHeaderStyle()}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getEventTypeIcon()}
            <div>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription>
                {format(new Date(event.start), "EEEE, MMMM d")}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label="Open menu"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-3">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs font-medium">Time</div>
                <div className="text-xs text-muted-foreground">
                  {format(event.start, "h:mm a")} -{" "}
                  {format(event.end, "h:mm a")}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs font-medium">Date</div>
                <div className="text-xs text-muted-foreground">
                  {format(event.start, "EEEE, MMMM d, yyyy")}
                </div>
              </div>
            </div>
          </div>

          {/* Location if available */}
          {((isGameEvent(event) && gameData?.location) ||
            (isTrainingEvent(event) && trainingData?.location)) && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs font-medium">Location</div>
                <div className="text-xs text-muted-foreground">
                  {isGameEvent(event)
                    ? gameData?.location?.name
                    : trainingData?.location?.name}
                  {(isGameEvent(event) && gameData?.location?.city) ||
                  (isTrainingEvent(event) && trainingData?.location?.city) ? (
                    <div>
                      {isGameEvent(event)
                        ? gameData?.location?.city
                        : trainingData?.location?.city}
                      {isGameEvent(event) &&
                        gameData?.location?.postcode &&
                        `, ${gameData?.location?.postcode}`}
                      {isTrainingEvent(event) &&
                        trainingData?.location?.postcode &&
                        `, ${trainingData?.location?.postcode}`}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Game-specific details */}
          {isGameEvent(event) && gameData && (
            <>
              <Separator className="my-2" />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <div className="text-xs font-medium">Match Details</div>
                </div>

                {/* Game card with score if available */}
                <div className="mt-1 rounded-md border bg-card/30 overflow-hidden">
                  {/* Teams section */}
                  <div className="p-2">
                    {gameData.displayDetails ? (
                      <div className="flex justify-between items-stretch">
                        {/* Home team */}
                        <div className="flex-1 text-center">
                          <div className="h-2 w-full mb-1.5 rounded-sm" />
                          <div className="text-xs font-medium truncate">
                            {gameData.displayDetails.homeTeam.name}
                          </div>
                          {/* Home team group info */}
                          {(gameData.displayDetails.homeTeam.details ||
                            gameData.displayDetails.homeTeam.group) && (
                            <div className="mt-1 flex items-center justify-center">
                              <div
                                className="h-2 w-2 rounded-full flex-shrink-0 mr-1"
                                style={{
                                  backgroundColor:
                                    gameData.displayDetails.homeTeam.color ||
                                    "#6366F1",
                                }}
                              />
                              <div className="text-xs text-muted-foreground">
                                {gameData.displayDetails.homeTeam.details ? (
                                  gameData.displayDetails.homeTeam.details
                                ) : (
                                  <>
                                    {gameData.displayDetails.homeTeam.group
                                      ?.age &&
                                      formatAgeDisplay(
                                        gameData.displayDetails.homeTeam.group
                                          .age
                                      )}
                                    {gameData.displayDetails.homeTeam.group
                                      ?.gender &&
                                      ` • ${formatGenderDisplay(
                                        gameData.displayDetails.homeTeam.group
                                          .gender
                                      )}`}
                                    {gameData.displayDetails.homeTeam.group
                                      ?.skill &&
                                      ` • ${gameData.displayDetails.homeTeam.group.skill}`}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* VS or score */}
                        <div className="px-3 flex-shrink-0 flex items-center">
                          {gameData.homeScore !== undefined &&
                          gameData.awayScore !== undefined ? (
                            <div className="flex items-center justify-center gap-1 bg-muted rounded-full px-2 py-0.5">
                              <span className="text-sm font-bold">
                                {gameData.homeScore}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                :
                              </span>
                              <span className="text-sm font-bold">
                                {gameData.awayScore}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <span className="text-xs font-medium text-muted-foreground">
                                VS
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Away team */}
                        <div className="flex-1 text-center">
                          <div className="h-2 w-full mb-1.5 rounded-sm" />
                          <div className="text-xs font-medium truncate">
                            {gameData.displayDetails.awayTeam.name}
                          </div>
                          {/* Away team group info */}
                          {(gameData.displayDetails.awayTeam.details ||
                            gameData.displayDetails.awayTeam.group) && (
                            <div className="mt-1 flex items-center justify-center">
                              <div
                                className="h-2 w-2 rounded-full flex-shrink-0 mr-1"
                                style={{
                                  backgroundColor:
                                    gameData.displayDetails.awayTeam.color ||
                                    "#6366F1",
                                }}
                              />
                              <div className="text-xs text-muted-foreground">
                                {gameData.displayDetails.awayTeam.details ? (
                                  gameData.displayDetails.awayTeam.details
                                ) : (
                                  <>
                                    {gameData.displayDetails.awayTeam.group
                                      ?.age &&
                                      formatAgeDisplay(
                                        gameData.displayDetails.awayTeam.group
                                          .age
                                      )}
                                    {gameData.displayDetails.awayTeam.group
                                      ?.gender &&
                                      ` • ${formatGenderDisplay(
                                        gameData.displayDetails.awayTeam.group
                                          .gender
                                      )}`}
                                    {gameData.displayDetails.awayTeam.group
                                      ?.skill &&
                                      ` • ${gameData.displayDetails.awayTeam.group.skill}`}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-stretch">
                        {/* Home team */}
                        <div className="flex-1 text-center">
                          <div className="text-xs font-medium truncate">
                            {gameData.homeTeam?.name || "Home Team"}
                          </div>
                          {/* Home team group info */}
                          {(gameData.homeTeam?.details ||
                            gameData.homeTeam?.group) && (
                            <div className="mt-1 flex items-center justify-center">
                              <div
                                className="h-2 w-2 rounded-full flex-shrink-0 mr-1"
                                style={{
                                  backgroundColor:
                                    gameData.homeTeam?.color || "#6366F1",
                                }}
                              />
                              <div className="text-xs text-muted-foreground">
                                {gameData.homeTeam?.details ? (
                                  gameData.homeTeam.details
                                ) : (
                                  <>
                                    {gameData.homeTeam?.group?.age &&
                                      formatAgeDisplay(
                                        gameData.homeTeam.group.age
                                      )}
                                    {gameData.homeTeam?.group?.gender &&
                                      ` • ${formatGenderDisplay(
                                        gameData.homeTeam.group.gender
                                      )}`}
                                    {gameData.homeTeam?.group?.skill &&
                                      ` • ${gameData.homeTeam.group.skill}`}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* VS or score */}
                        <div className="px-3 flex-shrink-0 flex items-center">
                          {gameData.homeScore !== undefined &&
                          gameData.awayScore !== undefined ? (
                            <div className="flex items-center justify-center gap-1 bg-muted rounded-full px-2 py-0.5">
                              <span className="text-sm font-bold">
                                {gameData.homeScore}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                :
                              </span>
                              <span className="text-sm font-bold">
                                {gameData.awayScore}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <span className="text-xs font-medium text-muted-foreground">
                                VS
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Away team */}
                        <div className="flex-1 text-center">
                          <div className="text-xs font-medium truncate">
                            {gameData.awayTeam?.name || "Away Team"}
                          </div>
                          {/* Away team group info */}
                          {(gameData.awayTeam?.details ||
                            gameData.awayTeam?.group) && (
                            <div className="mt-1 flex items-center justify-center">
                              <div
                                className="h-2 w-2 rounded-full flex-shrink-0 mr-1"
                                style={{
                                  backgroundColor:
                                    gameData.awayTeam?.color || "#6366F1",
                                }}
                              />
                              <div className="text-xs text-muted-foreground">
                                {gameData.awayTeam?.details ? (
                                  gameData.awayTeam.details
                                ) : (
                                  <>
                                    {gameData.awayTeam?.group?.age &&
                                      formatAgeDisplay(
                                        gameData.awayTeam.group.age
                                      )}
                                    {gameData.awayTeam?.group?.gender &&
                                      ` • ${formatGenderDisplay(
                                        gameData.awayTeam.group.gender
                                      )}`}
                                    {gameData.awayTeam?.group?.skill &&
                                      ` • ${gameData.awayTeam.group.skill}`}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Competition if available */}
                {gameData.displayDetails?.competition && (
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          gameData.displayDetails.competition.color ||
                          "#6366F1",
                      }}
                    />
                    <div className="text-xs text-muted-foreground">
                      {gameData.displayDetails.competition.name}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Training-specific details */}
          {isTrainingEvent(event) && trainingData?.team && (
            <>
              <Separator className="my-2" />
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-medium">Team</div>

                  {typeof trainingData.team === "object" &&
                    (trainingData.team?.age ||
                      trainingData.team?.gender ||
                      trainingData.team?.skill) && (
                      <div className="flex items-center mt-2">
                        <div
                          className="h-3 w-3 rounded-full flex-shrink-0 mr-2"
                          style={{
                            backgroundColor: (trainingData.team?.appearance
                              ?.color ||
                              (trainingData.team?.age
                                ? defaultEventColors[
                                    trainingData.team.age.split("#")[0] || "U12"
                                  ]
                                : "#6366F1")) as React.CSSProperties["backgroundColor"],
                          }}
                        />
                        <div className="text-xs text-muted-foreground">
                          {trainingData.team?.age &&
                            formatAgeDisplay(trainingData.team.age)}
                          {trainingData.team?.gender &&
                            ` • ${formatGenderDisplay(
                              trainingData.team.gender
                            )}`}
                          {trainingData.team?.skill &&
                            ` • ${trainingData.team.skill}`}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </>
          )}

          {/* Notes section - shown for any event type when notes exist */}
          {hasNotes && (
            <>
              {(isTrainingEvent(event) ||
                (isGameEvent(event) && gameData?.displayDetails)) && (
                <Separator className="my-2" />
              )}
              <div className="flex items-start gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-medium">Notes</div>
                  <div className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                    {isGameEvent(event)
                      ? gameData?.meta?.note
                      : isTrainingEvent(event)
                      ? trainingData?.meta?.note
                      : ""}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
