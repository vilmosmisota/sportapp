import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/libs/tailwind/utils";
import { MoreVertical, SquarePen, Trash2 } from "lucide-react";

type GroupedTraining = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: { id: string; name: string };
  teamId: number | null;
  teamName: string | null;
  trainingCount: number;
  firstDate: string;
  lastDate: string;
  seasonName?: string;
};

type TrainingGridProps = {
  trainings: GroupedTraining[];
  canManage?: boolean;
  onEdit?: (training: GroupedTraining) => void;
  onDelete?: (training: GroupedTraining) => void;
};

const daysOfWeek = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 0, name: "Sunday" },
];

export default function TrainingGrid({
  trainings,
  canManage = false,
  onEdit,
  onDelete,
}: TrainingGridProps) {
  const ActionMenu = ({ training }: { training: GroupedTraining }) => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-background/20 data-[state=open]:bg-background/20"
          size="sm"
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px] z-50">
        {onEdit && (
          <DropdownMenuItem className="group flex w-full items-center justify-between text-left p-0 text-sm font-medium text-neutral-700">
            <button
              onClick={() => onEdit(training)}
              className="w-full justify-start items-center gap-2 flex rounded-md p-2 transition-all duration-75 hover:bg-gray-100"
            >
              <SquarePen className="h-4 w-4" />
              Edit
            </button>
          </DropdownMenuItem>
        )}
        {onEdit && onDelete && <DropdownMenuSeparator />}
        {onDelete && (
          <DropdownMenuItem className="group flex w-full items-center justify-between text-left p-0 text-sm font-medium text-neutral-700">
            <button
              onClick={() => onDelete(training)}
              className="w-full justify-start items-center gap-2 flex text-red-500 rounded-md p-2 transition-all duration-75 hover:bg-gray-100"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Group trainings by day
  const trainingsByDay = daysOfWeek.map((day) => ({
    day,
    trainings: trainings.filter((t) => t.dayOfWeek === day.id),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {trainingsByDay.map(({ day, trainings: dayTrainings }) => (
        <div key={day.id} className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">
            {day.name}
          </h3>
          {dayTrainings.length > 0 ? (
            <div className="space-y-3">
              {dayTrainings.map((training, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <CardHeader className="bg-secondary/50 rounded-t-lg px-4 py-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                          {training.teamName || "Open Training"}
                        </span>
                        <span className="text-sm font-semibold">
                          {training.startTime} - {training.endTime}
                        </span>
                      </div>
                      {canManage && <ActionMenu training={training} />}
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 py-3 space-y-2">
                    <div className="flex flex-col text-sm">
                      <span className="text-muted-foreground">
                        {training.location.name}
                      </span>
                      <span className="text-muted-foreground">
                        {training.trainingCount} sessions
                      </span>
                      {training.seasonName && (
                        <span className="text-muted-foreground">
                          {training.seasonName}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No trainings scheduled
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
