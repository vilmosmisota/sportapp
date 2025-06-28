import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { GroupBadge } from "@/components/ui/group-badge";
import { ActiveAttendanceSession } from "@/entities/attendance/ActiveAttendanceSession.schema";
import { TenantGroupsConfig } from "@/entities/tenant/Tenant.schema";
import { cn } from "@/libs/tailwind/utils";
import { format } from "date-fns";
import Autoplay from "embla-carousel-autoplay";
import { AlertTriangle, Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ActiveSessionsCarouselProps {
  activeSessions: ActiveAttendanceSession[];
  tenantId: string;
  tenantGroupsConfig?: TenantGroupsConfig;
}

export function ActiveSessionsCarousel({
  activeSessions,
  tenantId,
  tenantGroupsConfig,
}: ActiveSessionsCarouselProps) {
  const [api, setApi] = useState<any>();

  // Sort active sessions by date and time
  const sortedActiveSessions = [...activeSessions].sort((a, b) => {
    // First sort by date
    const dateComparison =
      new Date(a.session.date).getTime() - new Date(b.session.date).getTime();
    if (dateComparison !== 0) return dateComparison;

    // If same date, sort by start time
    return a.session.startTime.localeCompare(b.session.startTime);
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

  // Helper function to check if session is older than a day
  const isPastSession = (sessionDate: string) => {
    const sessionDateObj = new Date(sessionDate);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return sessionDateObj < oneDayAgo;
  };

  if (activeSessions.length === 0) {
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
              {activeSessions.length} Active
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
            {sortedActiveSessions.map((activeSession) => {
              const isPast = isPastSession(activeSession.session.date);

              return (
                <CarouselItem
                  key={activeSession.id}
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
                      {activeSession.session.group && (
                        <div className="mb-3 flex justify-between items-start">
                          <GroupBadge
                            group={activeSession.session.group}
                            size="sm"
                            tenantGroupsConfig={tenantGroupsConfig}
                          />
                          {isPast && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Overdue
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mb-3">
                        <div className="text-sm font-medium text-primary mb-1">
                          {format(
                            new Date(activeSession.session.date),
                            "EEEE, MMMM d"
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            {formatTimeString(activeSession.session.startTime)}{" "}
                            - {formatTimeString(activeSession.session.endTime)}
                          </span>
                        </div>
                      </div>

                      {activeSession.session.location && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {activeSession.session.location.name},{" "}
                            {activeSession.session.location.city}
                          </span>
                        </div>
                      )}

                      <div className="mt-auto">
                        <div className="flex gap-2">
                          <Link
                            href={`/attendance/live-sessions/${activeSession.id}`}
                            className="flex-1"
                          >
                            <Button
                              variant="default"
                              className="w-full text-xs"
                              size="sm"
                            >
                              Manage
                            </Button>
                          </Link>
                          <Link
                            href={`/attendance/kiosk/${activeSession.id}/check-in`}
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              className="w-full text-xs"
                              size="sm"
                            >
                              Kiosk
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/container:opacity-100 transition-opacity" />
          <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/container:opacity-100 transition-opacity" />
        </Carousel>
      </div>
    </div>
  );
}
