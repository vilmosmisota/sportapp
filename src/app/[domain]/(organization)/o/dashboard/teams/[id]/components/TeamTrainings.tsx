"use client";

import { useGroupedTrainings } from "@/entities/training/Training.query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface TeamTrainingsProps {
  tenantId: string;
  teamId: number;
}

export default function TeamTrainings({
  tenantId,
  teamId,
}: TeamTrainingsProps) {
  const { data: groupedTrainings } = useGroupedTrainings(tenantId);

  const teamTrainings = groupedTrainings?.filter(
    (training) => training.teamId === teamId
  );

  if (!teamTrainings?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Training Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No training sessions scheduled for this team.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get season date range from the first training
  // (all trainings in a group should have the same season dates)
  const seasonStart = format(
    new Date(teamTrainings[0].firstDate),
    "MMM d, yyyy"
  );
  const seasonEnd = format(new Date(teamTrainings[0].lastDate), "MMM d, yyyy");

  // Convert dayOfWeek number to day name (0 = Sunday, 1 = Monday, etc.)
  const getDayName = (dayOfWeek: number) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayOfWeek];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">
          Training Schedule
        </CardTitle>
        <Badge variant="outline" className="ml-2">
          {seasonStart} - {seasonEnd}
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {teamTrainings.map((training) => (
              <div
                key={`${training.dayOfWeek}-${training.startTime}-${training.location.id}`}
                className="flex flex-col space-y-2 p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {getDayName(training.dayOfWeek)}s
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {training.startTime} - {training.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{training.location.name}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
