"use client";

import { useMemo } from "react";
import {
  format,
  isToday,
  isTomorrow,
  startOfDay,
  endOfDay,
  addDays,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CalendarEvent } from "./EventCalendar";
import { EventItem } from "./EventItem";
import { sortEvents } from "./utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CalendarDays, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Season } from "@/entities/season/Season.schema";
import { useGamesCalendarEvents, useTrainingsCalendarEvents } from "./hooks";
import { cn } from "@/libs/tailwind/utils";

interface UpcomingEventsBlockProps {
  tenantId: string;
  activeSeason: Season | null;
  tenantName?: string;
  isLoading?: boolean;
  domain?: string;
  className?: string;
}

export function UpcomingEventsBlock({
  tenantId,
  activeSeason,
  tenantName = "Our Team",
  isLoading = false,
  domain = "",
  className,
}: UpcomingEventsBlockProps) {
  // Calculate date range for the entire current month (to match schedule page)
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Also calculate today and tomorrow for filtering
  const today = startOfDay(currentDate);
  const tomorrow = endOfDay(addDays(today, 1));

  // Enable fetching only if we have required data
  const fetchingEnabled = !!tenantId && !!activeSeason;
  const seasonId = activeSeason?.id || 0;

  // Fetch games and trainings for the entire month (same as schedule page)
  const { data: gameEvents = [], isLoading: isLoadingGames } =
    useGamesCalendarEvents(
      tenantId,
      monthStart,
      monthEnd,
      seasonId,
      fetchingEnabled,
      tenantName
    );

  const { data: trainingEvents = [], isLoading: isLoadingTrainings } =
    useTrainingsCalendarEvents(
      tenantId,
      monthStart,
      monthEnd,
      seasonId,
      fetchingEnabled
    );

  // Combine and sort events
  const allEvents = useMemo(() => {
    return sortEvents([...gameEvents, ...trainingEvents]);
  }, [gameEvents, trainingEvents]);

  // Group events by day (today/tomorrow) - only filtering after getting all month data
  const { todayEvents, tomorrowEvents } = useMemo(() => {
    const todayFiltered: CalendarEvent[] = [];
    const tomorrowFiltered: CalendarEvent[] = [];

    allEvents.forEach((event) => {
      if (isToday(event.start)) {
        todayFiltered.push(event);
      } else if (isTomorrow(event.start)) {
        tomorrowFiltered.push(event);
      }
    });

    return { todayEvents: todayFiltered, tomorrowEvents: tomorrowFiltered };
  }, [allEvents]);

  const componentIsLoading = isLoading || isLoadingGames || isLoadingTrainings;

  // Custom rendering for empty state
  const renderEmptyState = (day: "today" | "tomorrow") => (
    <div className="flex flex-col items-center justify-center py-3 text-center bg-muted/20 rounded-md h-full min-h-[100px]">
      <div className="text-muted-foreground text-sm mb-1">No events {day}</div>
    </div>
  );

  // Render component loading state
  if (componentIsLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-6 w-40 mb-1" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-5">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Upcoming Events
            </CardTitle>
            <CardDescription>
              Scheduled games and trainings for today and tomorrow
            </CardDescription>
          </div>
          <Link href={`/o/dashboard/schedule`}>
            <Button size="sm" variant="outline" className="gap-1">
              Schedule <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's events */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm mb-2 flex items-center gap-1.5 text-primary">
              <Calendar className="h-4 w-4" />
              Today
            </h3>
            <div className="h-full">
              {todayEvents.length > 0 ? (
                <div className="space-y-2">
                  {todayEvents.map((event) => (
                    <EventItem key={event.id} event={event} variant="full" />
                  ))}
                </div>
              ) : (
                renderEmptyState("today")
              )}
            </div>
          </div>

          {/* Tomorrow's events */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm mb-2 flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Tomorrow - {format(addDays(today, 1), "EEEE, MMM d")}
            </h3>
            <div className="h-full">
              {tomorrowEvents.length > 0 ? (
                <div className="space-y-2">
                  {tomorrowEvents.map((event) => (
                    <EventItem key={event.id} event={event} variant="full" />
                  ))}
                </div>
              ) : (
                renderEmptyState("tomorrow")
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
