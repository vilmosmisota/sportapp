import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TeamBadge } from "@/components/ui/team-badge";
import { SessionWithGroup } from "@/entities/session/Session.schema";
import { cn } from "@/libs/tailwind/utils";
import { format } from "date-fns";
import Autoplay from "embla-carousel-autoplay";
import { AlertTriangle, Calendar, Clock, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ActiveSessionsCarouselProps {
  sessions: SessionWithGroup[];
  getActiveSessionId: (sessionId: number) => number | undefined;
  isPastSession: (session: SessionWithGroup) => boolean;
  onCloseSession: (sessionId: number) => Promise<void>;
  isClosingSession: boolean;
  tenantId: string;
}

export function ActiveSessionsCarousel({
  sessions,
  getActiveSessionId,
  isPastSession,
  onCloseSession,
  isClosingSession,
  tenantId,
}: ActiveSessionsCarouselProps) {
  const [api, setApi] = useState<any>();

  // Sort sessions by date and time
  const sortedSessions = [...sessions].sort((a, b) => {
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

  if (sessions.length === 0) {
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
              {sessions.length} Active
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
            {sortedSessions.map((session) => {
              const activeSessionId = getActiveSessionId(session.id);
              const isPast = isPastSession(session);

              return (
                <CarouselItem
                  key={session.id}
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
                      {session.group && (
                        <div className="mb-3 flex justify-between items-start">
                          <TeamBadge team={session.group} size="sm" />
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
                          {format(new Date(session.date), "EEEE, MMMM d")}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            {formatTimeString(session.startTime)} -{" "}
                            {formatTimeString(session.endTime)}
                          </span>
                        </div>
                      </div>

                      {session.location && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {session.location.name}, {session.location.city}
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
                            const sessionId = getActiveSessionId(session.id);
                            if (typeof sessionId === "number") {
                              onCloseSession(sessionId);
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
