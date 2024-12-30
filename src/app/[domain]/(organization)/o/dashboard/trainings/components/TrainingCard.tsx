import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, SquarePen } from "lucide-react";
import { cn } from "../../../../../../../libs/tailwind/utils";
import { useState } from "react";
import { TrainingDetailsDialog } from "./TrainingDetailsDialog";
import { GroupedTraining } from "@/entities/training/Training.schema";
import { formatTeamName } from "../utils";

interface TrainingCardProps {
  training: GroupedTraining;
  canManage: boolean;
  onEdit: (training: GroupedTraining) => void;
  onDelete: (training: GroupedTraining) => void;
  onUpdatePattern: (
    training: GroupedTraining,
    updates: { startTime?: string; endTime?: string; location?: any }
  ) => void;
}

export function TrainingCard({
  training,
  canManage,
  onEdit,
  onDelete,
  onUpdatePattern,
}: TrainingCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Format time to be more compact (24-hour format)
  const formatTime = (timeString: string) => {
    // The time is already in HH:mm format, so we can use it directly
    return timeString;
  };

  return (
    <>
      <div
        className={cn(
          "group relative rounded-md border bg-card p-1.5 shadow-sm transition-all text-xs cursor-pointer",
          "hover:shadow-md hover:scale-[1.02]"
        )}
        onClick={() => setShowDetails(true)}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <div className="font-medium leading-tight line-clamp-1">
              {formatTeamName(training.teamName)}
            </div>
            <div className="text-muted-foreground leading-tight">
              {formatTime(training.startTime)} - {formatTime(training.endTime)}
            </div>
            <div className="text-muted-foreground truncate leading-tight">
              {training.location.name} • {training.location.city}
            </div>
          </div>

          {canManage && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(training);
                  }}
                >
                  <SquarePen className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(training);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <TrainingDetailsDialog
        training={training}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        canManage={canManage}
        onEdit={onEdit}
        onDelete={onDelete}
        onUpdatePattern={onUpdatePattern}
      />
    </>
  );
}
