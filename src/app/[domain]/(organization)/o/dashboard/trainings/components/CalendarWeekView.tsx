import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TrainingCard } from "./TrainingCard";
import { GroupedTraining } from "@/entities/training/Training.schema";
import { Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DAYS = [
  { id: 1, name: "Monday", shortName: "Mon", dayOfWeek: 1 },
  { id: 2, name: "Tuesday", shortName: "Tue", dayOfWeek: 2 },
  { id: 3, name: "Wednesday", shortName: "Wed", dayOfWeek: 3 },
  { id: 4, name: "Thursday", shortName: "Thu", dayOfWeek: 4 },
  { id: 5, name: "Friday", shortName: "Fri", dayOfWeek: 5 },
  { id: 6, name: "Saturday", shortName: "Sat", dayOfWeek: 6 },
  { id: 7, name: "Sunday", shortName: "Sun", dayOfWeek: 7 },
];

interface DayWithTrainings {
  id: number;
  name: string;
  shortName: string;
  dayOfWeek: number;
  trainings: GroupedTraining[];
}

interface CalendarWeekViewProps {
  trainings: GroupedTraining[];
  canManage: boolean;
  onEdit: (training: GroupedTraining) => void;
  onDelete: (training: GroupedTraining) => void;
  onEditIndividual: (training: GroupedTraining) => void;
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
  onEditIndividual,
  onUpdatePattern,
}: CalendarWeekViewProps) {
  // Group trainings by day
  const trainingsByDay: DayWithTrainings[] = DAYS.map((day) => ({
    ...day,
    trainings: trainings.filter((t) => t.dayOfWeek === day.dayOfWeek),
  }));

  // Find the first day with trainings or default to Monday
  const initialDay =
    trainingsByDay.find((day) => day.trainings.length > 0)?.id.toString() ||
    "1";

  // Total trainings count for the header
  const totalTrainings = trainingsByDay.reduce(
    (total, day) => total + day.trainings.length,
    0
  );

  // Mobile view
  const MobileView = () => (
    <Tabs defaultValue={initialDay} className="w-full">
      <div className="px-4 pt-2">
        <TabsList className="grid grid-cols-7 w-full h-auto">
          {trainingsByDay.map((day) => (
            <TabsTrigger
              key={day.id}
              value={day.id.toString()}
              className="py-1.5 text-xs"
            >
              {day.shortName}
              {day.trainings.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                  {day.trainings.length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {trainingsByDay.map((day) => (
        <TabsContent
          key={day.id}
          value={day.id.toString()}
          className="px-4 mt-2 pb-4"
        >
          <div className="bg-muted rounded-md p-2 mb-3">
            <h4 className="font-medium text-sm">{day.name}</h4>
            <p className="text-xs text-muted-foreground">
              {day.trainings.length === 0
                ? "No trainings"
                : day.trainings.length === 1
                ? "1 training"
                : `${day.trainings.length} trainings`}
            </p>
          </div>
          {day.trainings.length > 0 ? (
            <div className="space-y-2">
              {day.trainings.map((training: GroupedTraining) => (
                <TrainingCard
                  key={`${training.dayOfWeek}-${training.startTime}-${training.teamId}`}
                  training={training}
                  canManage={canManage}
                  onEditPattern={onEdit}
                  onEditIndividual={onEditIndividual}
                  onDeletePattern={onDelete}
                  onSuccessCallback={() => {
                    // Refresh trainings after a successful action
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No trainings scheduled for {day.name}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );

  // Desktop view with fixed header and scrollable content
  const DesktopView = () => (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Weekly Schedule</span>
          </CardTitle>
        </div>
      </CardHeader>
      <ScrollArea className="w-full border-t">
        <div className="min-w-[800px] max-w-full">
          <div className="p-4">
            <div className="grid grid-cols-7 gap-4">
              {trainingsByDay.map((day) => (
                <div key={day.id} className="min-w-0">
                  <div className="bg-muted rounded-md p-2 mb-3">
                    <h4 className="font-medium text-sm truncate">{day.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {day.trainings.length === 0
                        ? "No trainings"
                        : day.trainings.length === 1
                        ? "1 training"
                        : `${day.trainings.length} trainings`}
                    </p>
                  </div>
                  {day.trainings.length > 0 ? (
                    <div className="space-y-2">
                      {day.trainings.map((training: GroupedTraining) => (
                        <TrainingCard
                          key={`${training.dayOfWeek}-${training.startTime}-${training.teamId}`}
                          training={training}
                          canManage={canManage}
                          onEditPattern={onEdit}
                          onEditIndividual={onEditIndividual}
                          onDeletePattern={onDelete}
                          onSuccessCallback={() => {
                            // Refresh trainings after a successful action
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed rounded-md text-muted-foreground text-sm">
                      No trainings
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );

  return (
    <div className="w-full">
      {/* Mobile tabs view (visible on smaller screens) */}
      <div className="block md:hidden">
        <Card>
          <MobileView />
        </Card>
      </div>

      {/* Desktop horizontal scroll view (visible on medium screens and up) */}
      <div className="hidden md:block">
        <DesktopView />
      </div>
    </div>
  );
}
