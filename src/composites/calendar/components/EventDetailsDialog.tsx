"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { useDeleteSession } from "@/entities/session/Session.actions.client";
import { format } from "date-fns";
import { Calendar, Clock, Edit, MapPin, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarEvent } from "../types/calendar.types";
import { SessionEvent } from "../types/event.types";

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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const deleteSessionMutation = useDeleteSession();

  if (!event) return null;

  // For session events, we'll display session-specific details
  const isSessionEvent = event.type === "session";
  const sessionEvent = isSessionEvent ? (event as SessionEvent) : null;
  const session = sessionEvent?.data;

  // Format date based on event start date
  const eventDate = event.startDate;
  const formattedDate = format(eventDate, "EEEE, MMMM d, yyyy");
  const formattedTime = `${format(event.startDate, "HH:mm")} - ${format(
    event.endDate,
    "HH:mm"
  )}`;

  // Format duration text - use the pre-calculated duration from SessionEvent if available
  const durationMinutes =
    sessionEvent?.duration ||
    Math.round(
      (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60)
    );

  const durationText =
    durationMinutes >= 60
      ? `${Math.floor(durationMinutes / 60)}h ${
          durationMinutes % 60 > 0 ? `${durationMinutes % 60}m` : ""
        }`
      : `${durationMinutes}m`;

  const handleEdit = () => {
    if (onEdit && event) {
      onEdit(event);
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  const executeDelete = async (eventId: string) => {
    try {
      if (isSessionEvent && session) {
        await deleteSessionMutation.mutateAsync({
          sessionId: session.id,
          tenantId: session.tenantId.toString(),
          groupId: session.groupId,
          seasonId: session.seasonId,
        });

        toast.success("Session deleted successfully");

        // Call the onDelete callback if provided
        if (onDelete) {
          onDelete(event);
        }
      } else {
        // For non-session events, just use the provided onDelete callback
        if (onDelete) {
          onDelete(event);
        }
      }

      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete session");
      console.error("Delete session error:", error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange} modal={true}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {/* Colored header with title */}
          <div className="p-6 bg-primary/10">
            <h2 className="text-2xl font-bold mb-1">
              {isSessionEvent ? "Session Details" : "Event Details"}
            </h2>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            {session?.isAggregated && (
              <div className="mt-2">
                <Badge className="bg-green-500 hover:bg-green-600 text-white">
                  Completed
                </Badge>
              </div>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* Time section with icon */}
            <div className="flex items-start gap-3">
              <div className="bg-muted rounded-full p-2 mt-0.5">
                <Clock className="h-5 w-5 text-foreground/70" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-0.5">
                  Time
                </div>
                <div className="text-base font-medium">{formattedTime}</div>
                <div className="text-sm text-muted-foreground">
                  {durationText} duration
                </div>
              </div>
            </div>

            {/* Location section with icon - only for session events */}
            {session?.location && (
              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-full p-2 mt-0.5">
                  <MapPin className="h-5 w-5 text-foreground/70" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-0.5">
                    Location
                  </div>
                  <div className="text-base font-medium">
                    {session.location?.name}
                  </div>
                  {session.location?.streetAddress && (
                    <div className="text-sm text-muted-foreground">
                      {session.location.streetAddress}, {session.location.city}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isSessionEvent && sessionEvent && (
              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-full p-2 mt-0.5">
                  <Users className="h-5 w-5 text-foreground/70" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-0.5">
                    Group
                  </div>
                  <div className="text-base font-medium">
                    {sessionEvent.groupName}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col px-6 py-4 border-t bg-muted/30">
            <div className="flex justify-between w-full mb-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2 h-9"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="flex items-center gap-2 h-9"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-9"
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {isSessionEvent && session && (
        <ConfirmDeleteDialog
          categoryId={session.id}
          text={`Are you sure you want to delete this session? This action cannot be undone.`}
          isOpen={isDeleteConfirmOpen}
          setIsOpen={setIsDeleteConfirmOpen}
          onConfirm={executeDelete}
          buttonText="Delete Session"
        />
      )}
    </>
  );
}
