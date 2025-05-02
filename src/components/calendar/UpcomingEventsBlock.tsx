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
  startOfWeek,
  endOfWeek,
  isSameDay,
  isPast,
  isThisWeek,
  differenceInCalendarDays,
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
import { Calendar, CalendarDays, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Season } from "@/entities/season/Season.schema";
import { useGamesCalendarEvents, useTrainingsCalendarEvents } from "./hooks";
import { cn } from "@/libs/tailwind/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // Calculate week range for UI display
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Week starts on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

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

  // Group events by day for the next 7 days
  const weeklyEvents = useMemo(() => {
    // Create array of 7 days starting from today
    const days = Array.from({ length: 7 }, (_, i) => addDays(currentDate, i));

    // Create map of days to events
    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayLabel = isToday(day)
        ? "Today"
        : isTomorrow(day)
        ? "Tomorrow"
        : format(day, "EEEE");

      const events = allEvents.filter((event) => isSameDay(event.start, day));

      return {
        date: day,
        label: dayLabel,
        formattedDate: format(day, "MMM d"),
        events,
        isPast: isPast(dayEnd),
        isToday: isToday(day),
      };
    });
  }, [allEvents, currentDate]);

  // For tabs, separate immediate events (today/tomorrow) and rest of week
  const todayTomorrowEvents = useMemo(() => {
    return weeklyEvents.slice(0, 2);
  }, [weeklyEvents]);

  const restOfWeekEvents = useMemo(() => {
    return weeklyEvents.slice(2);
  }, [weeklyEvents]);

  // Count upcoming events this week
  const upcomingEventCount = useMemo(() => {
    return weeklyEvents.reduce(
      (count, day) => count + (day.isPast ? 0 : day.events.length),
      0
    );
  }, [weeklyEvents]);

  const componentIsLoading = isLoading || isLoadingGames || isLoadingTrainings;

  // Custom rendering for empty state
  const renderEmptyDay = (day: string) => (
    <div className="flex flex-col items-center justify-center py-3 text-center bg-muted/20 rounded-md h-[76px]">
      <div className="text-muted-foreground text-sm">No events</div>
    </div>
  );

  // Render component loading state
  if (componentIsLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-6 w-52 mb-1" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 mb-1">
              <CalendarDays className="h-5 w-5 text-primary" />
              Week at a Glance
            </CardTitle>
            <CardDescription>
              Your schedule for the next 7 days
              {upcomingEventCount > 0 && (
                <>
                  {" "}
                  with{" "}
                  <span className="font-medium text-foreground">
                    {upcomingEventCount}
                  </span>{" "}
                  upcoming events
                </>
              )}
            </CardDescription>
          </div>
          <Link href={`/o/dashboard/schedule`}>
            <Button size="sm" variant="outline" className="gap-1">
              Full Schedule <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today-tomorrow" className="w-full">
          <TabsList className="mb-4 w-full grid grid-cols-2">
            <TabsTrigger value="today-tomorrow">Today & Tomorrow</TabsTrigger>
            <TabsTrigger value="week">Week Ahead</TabsTrigger>
          </TabsList>

          <TabsContent value="today-tomorrow" className="mt-0">
            <div className="space-y-4">
              {todayTomorrowEvents.map((day) => (
                <div key={day.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm flex items-center gap-1.5">
                      <Calendar
                        className={cn(
                          "h-4 w-4",
                          day.isToday ? "text-primary" : ""
                        )}
                      />
                      <span className={cn(day.isToday ? "text-primary" : "")}>
                        {day.label}
                      </span>
                      <span className="text-muted-foreground font-normal">
                        - {day.formattedDate}
                      </span>
                    </h3>

                    {day.events.length > 0 && (
                      <Badge variant="outline" className="font-normal">
                        {day.events.length}{" "}
                        {day.events.length === 1 ? "event" : "events"}
                      </Badge>
                    )}
                  </div>

                  <div>
                    {day.events.length > 0 ? (
                      <div className="space-y-2">
                        {day.events.map((event) => (
                          <EventItem
                            key={event.id}
                            event={event}
                            variant="full"
                          />
                        ))}
                      </div>
                    ) : (
                      renderEmptyDay(day.label)
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="week" className="mt-0">
            <div className="space-y-4">
              {restOfWeekEvents.map((day) => (
                <div key={day.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>{day.label}</span>
                      <span className="text-muted-foreground font-normal">
                        - {day.formattedDate}
                      </span>
                    </h3>

                    {day.events.length > 0 && (
                      <Badge variant="outline" className="font-normal">
                        {day.events.length}{" "}
                        {day.events.length === 1 ? "event" : "events"}
                      </Badge>
                    )}
                  </div>

                  <div>
                    {day.events.length > 0 ? (
                      <div className="space-y-2">
                        {day.events.map((event) => (
                          <EventItem
                            key={event.id}
                            event={event}
                            variant="full"
                          />
                        ))}
                      </div>
                    ) : (
                      renderEmptyDay(day.label)
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
