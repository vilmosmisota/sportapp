"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CalendarEvent } from "./EventCalendar";

import { defaultEventColors } from "./utils";

import {
  MapPin,
  Calendar,
  Users,
  ClipboardList,
  Clock,
  Trophy,
  Edit,
  Trash2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamBadge } from "@/components/ui/team-badge";
import { Badge } from "@/components/ui/badge";
import { PermissionButton } from "@/components/auth/PermissionButton";
import { Permission } from "@/entities/role/Role.permissions";
import {
  GameData,
  TrainingData,
  isGameEvent,
  isTrainingEvent,
  Team,
} from "./types";

// Add missing permission if not defined in the Role.permissions enum
// This is a temporary fix - in a real app, you would add this to the actual enum
const MANAGE_EVENTS_PERMISSION = "MANAGE_TRAINING" as Permission;

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  isLoading?: boolean;
}

export function EventDetailsDialog({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  isLoading = false,
}: EventDetailsDialogProps) {
  if (!isOpen) return null;

  // Render loading skeleton UI
  if (isLoading || !event) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <Skeleton className="h-7 w-[200px] mb-2" />
            <Skeleton className="h-5 w-[150px]" />
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-[180px]" />
              <Skeleton className="h-5 w-[220px]" />
            </div>

            <Separator />

            <div className="space-y-4">
              <Skeleton className="h-6 w-[130px] mb-2" />
              <Skeleton className="h-16 w-full rounded-md" />

              <Skeleton className="h-6 w-[100px] mt-4 mb-2" />
              <Skeleton className="h-8 w-[120px] rounded-full" />

              <Skeleton className="h-6 w-[80px] mt-4 mb-2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Skeleton className="h-9 w-[80px]" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-[80px]" />
              <Skeleton className="h-9 w-[80px]" />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Format time function
  const formatTime = (time: Date) => {
    return format(time, "h:mm a");
  };

  // Get event-specific details
  const getEventTitle = () => {
    if (isGameEvent(event)) {
      const gameData = event.data as GameData;
      const displayDetails = gameData.displayDetails;

      if (displayDetails) {
        return (
          displayDetails.homeTeam.name + " vs " + displayDetails.awayTeam.name
        );
      }

      return gameData.homeTeam?.name + " vs " + gameData.awayTeam?.name;
    }

    return event.title;
  };

  const getEventType = () => {
    return event.type.charAt(0).toUpperCase() + event.type.slice(1);
  };

  const getEventBadges = () => {
    if (isGameEvent(event)) {
      const gameData = event.data as GameData;
      const displayDetails = gameData.displayDetails;

      return (
        <div className="flex items-center gap-2">
          {event.type && (
            <Badge variant="outline" className="font-normal">
              {getEventType()}
            </Badge>
          )}
          {gameData.status && (
            <Badge variant="outline" className="font-normal">
              {gameData.status}
            </Badge>
          )}
          {displayDetails?.competition && (
            <Badge variant="outline" className="font-normal">
              {displayDetails.competition.name}
            </Badge>
          )}
        </div>
      );
    } else if (isTrainingEvent(event)) {
      const trainingData = event.data as TrainingData;

      return (
        <div className="flex items-center gap-2">
          {trainingData.team && (
            <TeamBadge team={trainingData.team as any} size="sm" />
          )}
          <Badge variant="outline" className="font-normal">
            {getEventType()}
          </Badge>
          <Badge variant="outline" className="font-normal">
            {format(event.start, "EEE")}
          </Badge>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-4">
          <div>
            <DialogTitle className="text-xl font-semibold mb-2">
              {getEventTitle()}
            </DialogTitle>
            <DialogDescription>{getEventType()} Details</DialogDescription>
          </div>
          {getEventBadges()}
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Time</div>
                  <div className="text-sm text-muted-foreground">
                    {formatTime(event.start)} - {formatTime(event.end)}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Date</div>
                  <div className="text-sm text-muted-foreground">
                    {format(event.start, "EEEE, MMMM d, yyyy")}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {((isGameEvent(event) && (event.data as GameData).location) ||
                (isTrainingEvent(event) &&
                  (event.data as TrainingData).location)) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Location</div>
                    <div className="text-sm text-muted-foreground">
                      <div>
                        {isGameEvent(event)
                          ? (event.data as GameData).location?.name
                          : (event.data as TrainingData).location?.name}
                      </div>
                      {isGameEvent(event) &&
                        (event.data as GameData).location && (
                          <>
                            <div>
                              {(event.data as GameData).location?.streetAddress}
                            </div>
                            <div>
                              {(event.data as GameData).location?.city},{" "}
                              {(event.data as GameData).location?.postcode}
                            </div>
                            {(event.data as GameData).location?.mapLink && (
                              <a
                                href={
                                  (event.data as GameData).location?.mapLink
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline mt-2 inline-flex items-center gap-1 text-sm"
                              >
                                View on Map
                                <MapPin className="h-3 w-3" />
                              </a>
                            )}
                          </>
                        )}
                      {isTrainingEvent(event) &&
                        (event.data as TrainingData).location && (
                          <>
                            <div>
                              {
                                (event.data as TrainingData).location
                                  ?.streetAddress
                              }
                            </div>
                            <div>
                              {(event.data as TrainingData).location?.city},{" "}
                              {(event.data as TrainingData).location?.postcode}
                            </div>
                            {(event.data as TrainingData).location?.mapLink && (
                              <a
                                href={
                                  (event.data as TrainingData).location?.mapLink
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline mt-2 inline-flex items-center gap-1 text-sm"
                              >
                                View on Map
                                <MapPin className="h-3 w-3" />
                              </a>
                            )}
                          </>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event-specific details */}
        {isGameEvent(event) && (
          <div className="mt-6">
            <Separator className="mb-6" />
            <div className="space-y-4">
              {/* Game-specific display */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  Teams
                </h3>

                {/* If we have displayDetails, use that for team display */}
                {(event.data as GameData).displayDetails ? (
                  <div className="flex flex-col space-y-4">
                    {/* Home Team from displayDetails */}
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">
                        Home Team
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: (event.data as GameData)
                              .displayDetails?.homeTeam.color,
                          }}
                        />
                        <div>
                          <div className="font-semibold text-sm">
                            {
                              (event.data as GameData).displayDetails?.homeTeam
                                .name
                            }
                          </div>
                          {(event.data as GameData).displayDetails?.homeTeam
                            .details && (
                            <div className="text-xs text-muted-foreground">
                              {
                                (event.data as GameData).displayDetails
                                  ?.homeTeam.details
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <span className="px-4 py-1 text-sm font-bold bg-muted rounded-full">
                        vs
                      </span>
                    </div>

                    {/* Away Team from displayDetails */}
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">
                        Away Team
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: (event.data as GameData)
                              .displayDetails?.awayTeam.color,
                          }}
                        />
                        <div>
                          <div className="font-semibold text-sm">
                            {
                              (event.data as GameData).displayDetails?.awayTeam
                                .name
                            }
                          </div>
                          {(event.data as GameData).displayDetails?.awayTeam
                            .details && (
                            <div className="text-xs text-muted-foreground">
                              {
                                (event.data as GameData).displayDetails
                                  ?.awayTeam.details
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Fallback to regular team objects */
                  <div className="flex flex-col space-y-4">
                    {/* Home Team from regular team object */}
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">
                        Home Team
                      </span>
                      {(event.data as GameData).homeTeam ? (
                        <div className="flex items-center gap-2">
                          {/* Only use TeamBadge if we have a proper team object */}
                          {typeof (event.data as GameData).homeTeam ===
                            "object" &&
                          (event.data as GameData).homeTeam !== null ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="h-4 w-4 rounded-full"
                                style={{
                                  backgroundColor:
                                    (event.data as GameData).homeTeam?.color ||
                                    "#6366F1",
                                }}
                              />
                              <span className="font-medium">
                                {(event.data as GameData).homeTeam?.name}
                              </span>
                            </div>
                          ) : (
                            <span className="font-medium">
                              {String((event.data as GameData).homeTeam)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm italic text-muted-foreground">
                          Unknown Team
                        </span>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <span className="px-4 py-1 text-sm font-bold bg-muted rounded-full">
                        vs
                      </span>
                    </div>

                    {/* Away Team from regular team object */}
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">
                        Away Team
                      </span>
                      {(event.data as GameData).awayTeam ? (
                        <div className="flex items-center gap-2">
                          {/* Only use TeamBadge if we have a proper team object */}
                          {typeof (event.data as GameData).awayTeam ===
                            "object" &&
                          (event.data as GameData).awayTeam !== null ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="h-4 w-4 rounded-full"
                                style={{
                                  backgroundColor:
                                    (event.data as GameData).awayTeam?.color ||
                                    "#6366F1",
                                }}
                              />
                              <span className="font-medium">
                                {(event.data as GameData).awayTeam?.name}
                              </span>
                            </div>
                          ) : (
                            <span className="font-medium">
                              {String((event.data as GameData).awayTeam)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm italic text-muted-foreground">
                          Unknown Team
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes if available */}
              {(event.data as GameData).meta?.note && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    Notes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {(event.data as GameData).meta?.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {isTrainingEvent(event) && (
          <div className="mt-6">
            <Separator className="mb-6" />
            <div className="space-y-4">
              {/* Training-specific display */}
              <div>
                <h3 className="text-sm font-medium mb-2">Team</h3>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {(event.data as TrainingData).team &&
                  typeof (event.data as TrainingData).team === "object" ? (
                    <div className="flex items-center gap-2">
                      {/* Get color from the team object using the same approach as TeamBadge */}
                      <div
                        className="h-4 w-4 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: ((event.data as TrainingData).team
                            ?.color ||
                            ((event.data as TrainingData).team?.age
                              ? defaultEventColors[
                                  (event.data as TrainingData).team?.age?.split(
                                    "#"
                                  )[0] || "U12"
                                ]
                              : "#6366F1")) as string, // Cast to string
                        }}
                      />
                      <div>
                        <div className="font-semibold text-sm">
                          {(event.data as TrainingData).team?.name}
                        </div>
                        {((event.data as TrainingData).team?.age ||
                          (event.data as TrainingData).team?.gender ||
                          (event.data as TrainingData).team?.skill) && (
                          <div className="text-xs text-muted-foreground">
                            {(event.data as TrainingData).team?.age &&
                              `${formatAgeDisplay(
                                (event.data as TrainingData).team?.age
                              )}`}
                            {(event.data as TrainingData).team?.gender &&
                              ` • ${(event.data as TrainingData).team?.gender}`}
                            {(event.data as TrainingData).team?.skill &&
                              ` • ${(event.data as TrainingData).team?.skill}`}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="font-medium">
                      {(event.data as TrainingData).team?.name ||
                        (event.data as TrainingData).teamName ||
                        "No team assigned"}
                    </span>
                  )}
                </div>
              </div>

              {(event.data as TrainingData).season && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Season</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {(event.data as TrainingData).season?.customName ||
                        "Unknown season"}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes if available */}
              {(event.data as TrainingData).meta?.note && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    Notes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {(event.data as TrainingData).meta?.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {(onEdit || onDelete) && (
          <>
            <Separator className="my-6" />
            <div className="flex gap-3">
              {onEdit && (
                <PermissionButton
                  variant="outline"
                  className="flex-1"
                  permission={MANAGE_EVENTS_PERMISSION}
                  onClick={() => {
                    if (onEdit) {
                      onEdit(event);
                      onClose();
                    }
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit {event.type}
                </PermissionButton>
              )}
              {onDelete && (
                <PermissionButton
                  variant="destructive"
                  className={onEdit ? "size-icon" : "flex-1"}
                  permission={MANAGE_EVENTS_PERMISSION}
                  onClick={() => {
                    if (onDelete) {
                      onDelete(event);
                      onClose();
                    }
                  }}
                >
                  {onEdit ? (
                    <Trash2 className="h-4 w-4" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </PermissionButton>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper function to determine text color based on background color (kept for compatibility)
function getContrastColor(hexColor: string): string {
  // Remove the hash if it exists
  const color = hexColor.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
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
