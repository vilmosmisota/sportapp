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
import { Button } from "@/components/ui/button";
import { defaultEventColors, gameStatusColors, formatEventTime } from "./utils";
import { Game, GameStatus } from "@/entities/game/Game.schema";
import { Training } from "@/entities/training/Training.schema";
import { MapPin, Calendar, Users, ClipboardList, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
}

export function EventDetailsDialog({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: EventDetailsDialogProps) {
  if (!event) return null;

  // Get event-specific details
  const getEventSpecificDetails = () => {
    if (event.type === "game") {
      const game = event.data as Game;
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Teams</h3>
            <div className="flex items-center justify-between bg-muted p-3 rounded-md">
              <div className="font-medium">
                {game.homeTeam?.name || "Unknown Team"}
              </div>
              <div className="text-sm font-semibold">vs</div>
              <div className="font-medium">
                {game.awayTeam?.name || "Unknown Team"}
              </div>
            </div>
          </div>

          {game.status && (
            <div>
              <h3 className="text-sm font-medium mb-2">Status</h3>
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium
                  ${
                    gameStatusColors[game.status as GameStatus]?.bg ||
                    "bg-gray-100"
                  }
                  ${
                    gameStatusColors[game.status as GameStatus]?.text ||
                    "text-gray-800"
                  }`}
                >
                  {game.status}
                </span>
              </div>
            </div>
          )}

          {(game.homeScore !== undefined || game.awayScore !== undefined) && (
            <div>
              <h3 className="text-sm font-medium mb-2">Score</h3>
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">{game.homeScore ?? "-"}</div>
                <div className="text-xs text-muted-foreground mx-2">:</div>
                <div className="text-xl font-bold">{game.awayScore ?? "-"}</div>
              </div>
            </div>
          )}
        </div>
      );
    } else if (event.type === "training") {
      const training = event.data as Training;
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Team</h3>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{training.team?.name || "No team assigned"}</span>
            </div>
          </div>

          {training.trainingSeasonConnections &&
            training.trainingSeasonConnections.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Season</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {training.trainingSeasonConnections[0].season?.customName ||
                      "Unknown season"}
                  </span>
                </div>
              </div>
            )}
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
          <DialogDescription>
            {format(event.start, "EEEE, MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Common event details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatEventTime(event.start, event.end)}</span>
            </div>

            {((event.type === "game" && (event.data as Game).location) ||
              (event.type === "training" &&
                (event.data as Training).location)) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {event.type === "game"
                    ? (event.data as Game).location?.name
                    : (event.data as Training).location?.name}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Event type specific details */}
          {getEventSpecificDetails()}

          {/* Notes (if available) */}
          {event.type === "game" && (event.data as Game).notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Notes
                </h3>
                <p className="text-sm text-muted-foreground">
                  {(event.data as Game).notes}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          {onDelete && (
            <Button variant="destructive" onClick={() => onDelete(event)}>
              Delete
            </Button>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>

            {onEdit && <Button onClick={() => onEdit(event)}>Edit</Button>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
