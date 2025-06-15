"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Session } from "@/entities/session/Session.schema";
import { format } from "date-fns";
import { Edit, MapPin, Trash2 } from "lucide-react";
import { CalendarEvent } from "../types/calendar.types";

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
}

export function EventDetailsDialog({
  event,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
}: EventDetailsDialogProps) {
  if (!event) return null;

  // For session events, we'll display session-specific details
  const isSessionEvent = event.type === "session";
  const session = isSessionEvent ? (event.data as Session) : null;

  // Format date based on event start date
  const eventDate = event.startDate;
  const formattedDate = format(eventDate, "EEEE, MMMM d, yyyy");

  const handleEdit = () => {
    if (onEdit && event) {
      onEdit(event);
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (onDelete && event) {
      onDelete(event);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isSessionEvent ? "Session Details" : "Event Details"}
          </DialogTitle>
          <DialogDescription className="text-base font-medium text-foreground">
            {formattedDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Time */}
          <div className="flex flex-col space-y-1">
            <div className="text-sm font-medium text-muted-foreground">
              Time
            </div>
            <div className="text-base">
              {format(event.startDate, "HH:mm")} -{" "}
              {format(event.endDate, "HH:mm")}
            </div>
          </div>

          {/* Location - only for session events */}
          {isSessionEvent && session?.location && (
            <div className="flex flex-col space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                Location
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-base">
                  {session.location?.name || "No location specified"}
                </span>
              </div>
            </div>
          )}

          {/* Additional metadata badges */}
          {isSessionEvent && session && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                Group ID: {session.groupId}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Season ID: {session.seasonId}
              </Badge>
              {session.isAggregated && (
                <Badge className="bg-blue-500 text-white text-xs">
                  Aggregated
                </Badge>
              )}
            </div>
          )}

          {/* Generic event metadata */}
          {event.metadata?.description && (
            <div className="flex flex-col space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                Description
              </div>
              <div className="text-base">{event.metadata.description}</div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
