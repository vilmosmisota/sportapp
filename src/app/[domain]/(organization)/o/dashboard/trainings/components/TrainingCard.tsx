import { Button } from "@/components/ui/button";
import {
  PermissionDropdownMenu,
  MenuAction,
} from "@/components/auth/PermissionDropdownMenu";
import { Permission } from "@/entities/role/Role.permissions";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Users,
  CalendarClock,
  Hash,
  CalendarRange,
  Edit,
} from "lucide-react";
import { cn } from "@/libs/tailwind/utils";
import { useState, useMemo } from "react";
import { TrainingDetailsDialog } from "./TrainingDetailsDialog";
import { GroupedTraining } from "@/entities/training/Training.schema";
import { formatTeamName } from "../utils";
import { format } from "date-fns";

interface TrainingCardProps {
  training: GroupedTraining;
  canManage?: boolean;
  isExpired?: boolean;
  onSuccessCallback?: () => void;
  onEditPattern?: (training: GroupedTraining) => void;
  onEditIndividual?: (training: GroupedTraining) => void;
  onDeletePattern?: (training: GroupedTraining) => void;
}

export function TrainingCard({
  training,
  canManage = false,
  isExpired = false,
  onSuccessCallback,
  onEditPattern,
  onEditIndividual,
  onDeletePattern,
}: TrainingCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const sessionCount = training.trainingCount || 1;

  const teamColor = useMemo(() => {
    // Use the team's appearance color if available
    if (training.team?.appearance?.color) {
      return training.team.appearance.color;
    }

    // Fallback to generating a color based on teamId for consistency
    if (!training.teamId) return "#888888"; // Default gray for no team

    // Generate a deterministic color based on teamId if no appearance color
    const hash = String(training.teamId)
      .split("")
      .reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
    return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
  }, [training.teamId, training.team?.appearance?.color]);

  function formatTime(time: string) {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return format(date, "h:mm a");
  }

  const menuActions: MenuAction[] = [
    {
      label: "Edit Pattern",
      onClick: () => {
        setShowDetails(false);
        onEditPattern?.(training);
      },
      icon: <CalendarRange className="h-4 w-4" />,
      permission: Permission.MANAGE_TRAINING,
    },
    {
      label: "Edit Training",
      onClick: () => {
        setShowDetails(false);
        onEditIndividual?.(training);
      },
      icon: <Edit className="h-4 w-4" />,
      permission: Permission.MANAGE_TRAINING,
    },
    {
      label: "Delete Pattern",
      onClick: () => {
        setShowDetails(false);
        onDeletePattern?.(training);
      },
      icon: <Trash2 className="h-4 w-4" />,
      permission: Permission.MANAGE_TRAINING,
      variant: "destructive",
    },
  ];

  return (
    <>
      <div
        className={cn(
          "group relative rounded-md border bg-card p-1.5 shadow-sm transition-all text-xs cursor-pointer",
          "hover:shadow-md hover:scale-[1.02]"
        )}
        onClick={() => setShowDetails(true)}
        style={{ borderLeftColor: teamColor, borderLeftWidth: "3px" }}
      >
        <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-muted/80 px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-muted-foreground">
          <Hash className="h-3 w-3" />
          <span>{sessionCount}</span>
        </div>

        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1 mt-3">
            <div className="font-medium leading-tight line-clamp-1 mb-1.5">
              {formatTeamName(training.teamName)}
            </div>
            <div className="text-muted-foreground leading-tight">
              {formatTime(training.startTime)} - {formatTime(training.endTime)}
            </div>
            <div className="text-muted-foreground truncate leading-tight">
              {training.location.name} • {training.location.city}
            </div>
            <div className="text-muted-foreground truncate leading-tight mt-1 text-[10px]">
              {format(new Date(training.firstDate), "MMM d")} -{" "}
              {training.lastDate
                ? format(new Date(training.lastDate), "MMM d")
                : "Ongoing"}
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <PermissionDropdownMenu
              actions={menuActions}
              buttonClassName="h-6 w-6 opacity-0 group-hover:opacity-100"
            />
          </div>
        </div>
      </div>

      <TrainingDetailsDialog
        training={training}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        canManage={canManage}
        onEdit={() => {
          setShowDetails(false);
          onEditPattern?.(training);
        }}
        onDelete={() => {
          setShowDetails(false);
          onDeletePattern?.(training);
        }}
        onUpdatePattern={(training, updates) => {
          setShowDetails(false);
          onSuccessCallback?.();
        }}
        onEditIndividual={() => {
          setShowDetails(false);
          onEditIndividual?.(training);
        }}
      />
    </>
  );
}
