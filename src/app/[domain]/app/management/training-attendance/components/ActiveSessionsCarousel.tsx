import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Training } from "@/entities/training/Training.schema";
import { cn } from "@/libs/tailwind/utils";
import { MapPin, Clock, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { TeamBadge } from "@/components/ui/team-badge";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  getDisplayAgeGroup,
  getDisplayGender,
} from "@/entities/group/Group.schema";

interface ActiveSessionsCarouselProps {
  trainings: Training[];
  getActiveSessionId: (trainingId: number) => number | undefined;
  isPastTraining: (training: Training) => boolean;
  onCloseSession: (sessionId: number, teamId?: number) => Promise<void>;
  isClosingSession: boolean;
  tenantId: string;
}

export function ActiveSessionsCarousel({
  trainings,
  getActiveSessionId,
  isPastTraining,
  onCloseSession,
  isClosingSession,
  tenantId,
}: ActiveSessionsCarouselProps) {
  const [api, setApi] = useState<any>();

  // Sort trainings by date and time
  const sortedTrainings = [...trainings].sort((a, b) => {
    // First sort by date
    const dateComparison =
      new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateComparison !== 0) return dateComparison;

    // If same date, sort by start time
    return a.startTime.localeCompare(b.startTime);
  });

  function formatTimeString(timeStr: string) {
    try {
      // Create a date object for today with the given time
      const today = new Date();
      const [hours, minutes] = timeStr.split(":");
      const date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        parseInt(hours),
        parseInt(minutes)
      );
      return format(date, "h:mm a");
    } catch (error) {
      console.error("Error parsing time:", error);
      return timeStr;
    }
  }

  if (trainings.length === 0) {
    return (
      <Card className="mb-6 bg-muted/40">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No active sessions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Active Sessions</h3>
            <div className="px-2 py-0.5 bg-green-500/10 text-green-600 text-xs rounded-full font-medium">
              {trainings.length} Active
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage attendance for active training sessions
          </p>
        </div>
      </div>

      <div className="relative px-8 py-3 -mx-4 sm:-mx-0 rounded-lg border border-green-500/20 bg-green-500/5 group/container hover:bg-green-500/10 transition-colors">
        <Carousel
          setApi={setApi}
          className="w-full relative"
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: true,
            }),
          ]}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {sortedTrainings.map((training) => {
              const activeSessionId = getActiveSessionId(training.id);
              const isPast = isPastTraining(training);

              return (
                <CarouselItem
                  key={training.id}
                  className="pl-2 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <Card
                    className={cn(
                      "h-full rounded-md border bg-card p-4 shadow-sm transition-all",
                      "hover:shadow-md hover:scale-[1.02] group/card",
                      isPast && "border-red-200"
                    )}
                  >
                    <div className="flex flex-col h-full">
                      {training.team && (
                        <div className="mb-3 flex justify-between items-start">
                          <TeamBadge team={training.team} size="sm" />
                          {isPast && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Past
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mb-3">
                        <div className="text-sm font-medium text-primary mb-1">
                          {format(new Date(training.date), "EEEE, MMMM d")}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            {formatTimeString(training.startTime)} -{" "}
                            {formatTimeString(training.endTime)}
                          </span>
                        </div>
                      </div>

                      {training.location && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {training.location.name}, {training.location.city}
                          </span>
                        </div>
                      )}

                      <div className="mt-auto space-y-2">
                        <div className="flex gap-2">
                          <Link
                            href={`/o/dashboard/training-attendance/${activeSessionId}`}
                            className="flex-1"
                          >
                            <Button
                              variant="secondary"
                              className="w-full text-xs"
                              size="sm"
                            >
                              View Session
                            </Button>
                          </Link>
                          <Link
                            href={`/o/dashboard/training-attendance/${activeSessionId}/check-in`}
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              className="w-full text-xs"
                              size="sm"
                            >
                              Check In
                            </Button>
                          </Link>
                        </div>
                        <Button
                          variant={isPast ? "destructive" : "outline"}
                          className="w-full text-xs"
                          size="sm"
                          onClick={() => {
                            // Get the active session ID and ensure it's a number
                            const sessionId = getActiveSessionId(training.id);
                            if (typeof sessionId === "number") {
                              // Convert null to undefined for teamId if needed
                              const teamId =
                                training.teamId === null
                                  ? undefined
                                  : training.teamId;
                              onCloseSession(sessionId, teamId);
                            }
                          }}
                          disabled={isClosingSession}
                        >
                          {isClosingSession ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Closing...
                            </>
                          ) : (
                            "Close Session"
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-4 h-8 w-8 opacity-0 group-hover/container:opacity-100 transition-opacity" />
          <CarouselNext className="absolute -right-4 h-8 w-8 opacity-0 group-hover/container:opacity-100 transition-opacity" />
        </Carousel>
      </div>
    </div>
  );
}
