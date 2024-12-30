import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  MapPin,
  Users,
  Clock,
  SquarePen,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { GroupedTraining } from "@/entities/training/Training.schema";
import { formatTeamName } from "../utils";

interface TrainingDetailsDialogProps {
  training: GroupedTraining | null;
  isOpen: boolean;
  onClose: () => void;
  canManage: boolean;
  onEdit: (training: GroupedTraining) => void;
  onDelete: (training: GroupedTraining) => void;
  onUpdatePattern: (
    training: GroupedTraining,
    updates: { startTime?: string; endTime?: string; location?: any }
  ) => void;
}

export function TrainingDetailsDialog({
  training,
  isOpen,
  onClose,
  canManage,
  onEdit,
  onDelete,
  onUpdatePattern,
}: TrainingDetailsDialogProps) {
  if (!training) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {formatTeamName(training.teamName)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Time</div>
              <div className="text-sm text-muted-foreground">
                {training.startTime} - {training.endTime}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Location</div>
              <div className="text-sm text-muted-foreground">
                {training.location.name}
                <br />
                {training.location.streetAddress}
                <br />
                {training.location.city}, {training.location.postcode}
              </div>
              {training.location.mapLink && (
                <a
                  href={training.location.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline mt-1 inline-block"
                >
                  View on Map
                </a>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Schedule</div>
              <div className="text-sm text-muted-foreground">
                From {formatDate(training.firstDate)}
                <br />
                To {formatDate(training.lastDate)}
                <br />
                Total sessions: {training.trainingCount}
              </div>
            </div>
          </div>
        </div>

        {canManage && (
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onEdit(training);
                onClose();
              }}
            >
              <SquarePen className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(training);
                onClose();
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
