import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  MapPin,
  Clock,
  CalendarRange,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { GroupedTraining } from "@/entities/training/Training.schema";
import { formatTeamName } from "../utils";
import { TeamBadge } from "@/components/ui/team-badge";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PermissionButton } from "@/components/auth/PermissionButton";
import { Permission } from "@/entities/role/Role.permissions";

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
  onEditIndividual?: (training: GroupedTraining) => void;
}

export function TrainingDetailsDialog({
  training,
  isOpen,
  onClose,
  canManage,
  onEdit,
  onDelete,
  onUpdatePattern,
  onEditIndividual,
}: TrainingDetailsDialogProps) {
  if (!training) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy");
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return format(date, "h:mm a");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-4">
          <div>
            <DialogTitle className="text-xl font-semibold mb-2">
              {formatTeamName(training.teamName)}
            </DialogTitle>
            <DialogDescription>Training Pattern Details</DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            {training.team && <TeamBadge team={training.team} size="sm" />}
            <Badge variant="outline" className="font-normal">
              {training.trainingCount}{" "}
              {training.trainingCount === 1 ? "session" : "sessions"}
            </Badge>
            <Badge variant="outline" className="font-normal">
              {format(new Date(training.firstDate), "EEE")}
            </Badge>
          </div>
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
                    {formatTime(training.startTime)} -{" "}
                    {formatTime(training.endTime)}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Schedule</div>
                  <div className="text-sm text-muted-foreground">
                    <div>From {formatDate(training.firstDate)}</div>
                    <div>To {formatDate(training.lastDate)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-sm text-muted-foreground">
                    <div>{training.location.name}</div>
                    <div>{training.location.streetAddress}</div>
                    <div>
                      {training.location.city}, {training.location.postcode}
                    </div>
                    {training.location.mapLink && (
                      <a
                        href={training.location.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline mt-2 inline-flex items-center gap-1 text-sm"
                      >
                        View on Map
                        <MapPin className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {canManage && (
          <>
            <Separator className="my-6" />
            <div className="flex gap-3">
              <PermissionButton
                variant="outline"
                className="flex-1"
                permission={Permission.MANAGE_TRAINING}
                onClick={() => {
                  onEdit(training);
                  onClose();
                }}
              >
                <CalendarRange className="h-4 w-4 mr-2" />
                Edit Pattern
              </PermissionButton>
              <PermissionButton
                variant="outline"
                className="flex-1"
                permission={Permission.MANAGE_TRAINING}
                onClick={() => {
                  if (onEditIndividual) {
                    onEditIndividual(training);
                    onClose();
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Training
              </PermissionButton>
              <PermissionButton
                variant="destructive"
                size="icon"
                permission={Permission.MANAGE_TRAINING}
                onClick={() => {
                  onDelete(training);
                  onClose();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </PermissionButton>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
