import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TrainingCard } from "./TrainingCard";
import { GroupedTraining } from "@/entities/training/Training.schema";

const DAYS = [
  { id: 1, name: "Monday", dayOfWeek: 1 },
  { id: 2, name: "Tuesday", dayOfWeek: 2 },
  { id: 3, name: "Wednesday", dayOfWeek: 3 },
  { id: 4, name: "Thursday", dayOfWeek: 4 },
  { id: 5, name: "Friday", dayOfWeek: 5 },
  { id: 6, name: "Saturday", dayOfWeek: 6 },
  { id: 7, name: "Sunday", dayOfWeek: 7 },
];

interface CalendarWeekViewProps {
  trainings: GroupedTraining[];
  canManage: boolean;
  onEdit: (training: GroupedTraining) => void;
  onDelete: (training: GroupedTraining) => void;
  onUpdatePattern: (
    training: GroupedTraining,
    updates: { startTime?: string; endTime?: string; location?: any }
  ) => void;
}

export function CalendarWeekView({
  trainings,
  canManage,
  onEdit,
  onDelete,
  onUpdatePattern,
}: CalendarWeekViewProps) {
  // Group trainings by day
  const trainingsByDay = DAYS.map((day) => ({
    ...day,
    trainings: trainings.filter((t) => t.dayOfWeek === day.dayOfWeek),
  }));

  return (
    <div className="w-full rounded-md border">
      <div className="grid grid-cols-7">
        {trainingsByDay.map((day) => (
          <div
            key={day.id}
            className="border-l first:border-l-0 min-h-[500px] p-3"
          >
            <div className="text-sm font-medium text-center mb-4">
              {day.name}
            </div>
            <div className="space-y-2">
              {day.trainings.length > 0 ? (
                day.trainings
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((training) => (
                    <TrainingCard
                      key={`${training.teamId}-${training.startTime}`}
                      training={training}
                      canManage={canManage}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onUpdatePattern={onUpdatePattern}
                    />
                  ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No trainings
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
