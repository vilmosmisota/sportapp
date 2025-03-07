"use client";

import { useState, useEffect } from "react";
import {
  format,
  parseISO,
  startOfDay,
  addHours,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import {
  EventCalendar,
  CalendarEvent,
} from "@/components/calendar/EventCalendar";
import { EventDetailsDialog } from "@/components/calendar/EventDetailsDialog";
import { Game, GameStatus } from "@/entities/game/Game.schema";
import { Training } from "@/entities/training/Training.schema";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Info, Keyboard } from "lucide-react";
import { toast } from "sonner";
import { SimpleFilter } from "@/components/calendar/filters/SimpleFilter";

type PageProps = {
  params: {
    domain: string;
  };
};

export default function CalendarPage({ params }: PageProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });

  // Load events when component mounts or date range changes
  useEffect(() => {
    const loadEventsForRange = async () => {
      setIsLoading(true);

      // Simulate API loading delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // In a real app, you would fetch events for the specific date range:
      // const games = await fetchGamesForDateRange(params.domain, dateRange.start, dateRange.end);
      // const trainings = await fetchTrainingsForDateRange(params.domain, dateRange.start, dateRange.end);

      // For demo, let's create mock events within the date range
      const mockEvents = generateMockEventsForRange(
        dateRange.start,
        dateRange.end
      );
      setEvents(mockEvents);
      // Initialize filtered events but don't update them if SimpleFilter has already done filtering
      setFilteredEvents((prev) => (prev.length === 0 ? mockEvents : prev));
      setIsLoading(false);
    };

    loadEventsForRange();
  }, [params.domain, dateRange]);

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  // Handle date range change (when user navigates to a different month/week)
  const handleDateRangeChange = (start: Date, end: Date) => {
    // Only update the dateRange state if the range has actually changed
    setDateRange((prev) => {
      if (
        prev.start.getTime() === start.getTime() &&
        prev.end.getTime() === end.getTime()
      ) {
        return prev; // No change needed
      }
      console.log(
        `Date range changed: ${format(start, "yyyy-MM-dd")} to ${format(
          end,
          "yyyy-MM-dd"
        )}`
      );
      return { start, end };
    });
  };

  // Handle event edit
  const handleEventEdit = (event: CalendarEvent) => {
    toast.info("Edit functionality would open here", {
      description: `Editing ${event.type}: ${event.title}`,
    });
    setIsEventDetailsOpen(false);
    // In a real app, you would open edit form here
  };

  // Handle event delete
  const handleEventDelete = (event: CalendarEvent) => {
    toast.info("Delete functionality would be triggered here", {
      description: `Deleting ${event.type}: ${event.title}`,
    });
    setIsEventDetailsOpen(false);
    // In a real app, you would confirm and delete the event
  };

  // Generate mock events for demonstration
  const generateMockEvents = (): CalendarEvent[] => {
    const mockEvents: CalendarEvent[] = [];
    const today = startOfDay(new Date());

    // Game events
    const gameStatuses = [
      GameStatus.Scheduled,
      GameStatus.InProgress,
      GameStatus.Completed,
      GameStatus.Postponed,
    ];

    for (let i = -5; i < 15; i++) {
      const gameDate = addHours(today, 24 * i + 14); // afternoon games

      const mockGame: Game = {
        id: i + 100,
        homeTeam: { id: 1, name: "Lions FC", appearance: { color: "blue" } },
        awayTeam: {
          id: 2,
          name: "Tigers United",
          appearance: { color: "orange" },
        },
        status: gameStatuses[Math.floor(Math.random() * gameStatuses.length)],
        type: "league",
        homeScore: i > 0 ? null : Math.floor(Math.random() * 5),
        awayScore: i > 0 ? null : Math.floor(Math.random() * 5),
        location: { id: 1, name: "City Stadium", address: "123 Main St" },
        startTime: format(gameDate, "HH:mm"),
        date: format(gameDate, "yyyy-MM-dd"),
        tenantId: 1,
        seasonId: 1,
        notes:
          i % 3 === 0 ? "Important match against a rival team." : undefined,
      } as unknown as Game;

      mockEvents.push({
        id: `game-${i + 100}`,
        type: "game",
        title: `${mockGame.homeTeam?.name} vs ${mockGame.awayTeam?.name}`,
        start: gameDate,
        end: addHours(gameDate, 2),
        color: "blue",
        data: mockGame,
      });
    }

    // Training events
    for (let i = -3; i < 20; i++) {
      // Skip some days to avoid having training every day
      if (i % 2 === 0) continue;

      const trainingDate = addHours(today, 24 * i + 18); // evening trainings

      const mockTraining: Training = {
        id: i + 200,
        date: trainingDate,
        startTime: format(trainingDate, "HH:mm"),
        endTime: format(addHours(trainingDate, 1.5), "HH:mm"),
        location: { id: 2, name: "Training Ground", address: "456 Park Ave" },
        teamId: 1,
        tenantId: 1,
        team: { id: 1, name: "Lions FC", appearance: { color: "blue" } },
        trainingSeasonConnections: [
          {
            id: 1,
            trainingId: i + 200,
            seasonId: 1,
            tenantId: 1,
            season: {
              id: 1,
              startDate: new Date(),
              endDate: new Date(),
              isActive: true,
              customName: "Season 2023-2024",
              breaks: [],
              phases: null,
            },
          },
        ],
      } as unknown as Training;

      mockEvents.push({
        id: `training-${i + 200}`,
        type: "training",
        title: `${mockTraining.team?.name} Training`,
        start: trainingDate,
        end: addHours(trainingDate, 1.5),
        color: "green",
        data: mockTraining,
      });
    }

    return mockEvents;
  };

  // Generate mock events for a specific date range
  const generateMockEventsForRange = (
    start: Date,
    end: Date
  ): CalendarEvent[] => {
    const mockEvents: CalendarEvent[] = [];
    const today = startOfDay(new Date());

    // Game events
    const gameStatuses = [
      GameStatus.Scheduled,
      GameStatus.InProgress,
      GameStatus.Completed,
      GameStatus.Postponed,
    ];

    for (let i = -5; i < 15; i++) {
      const gameDate = addHours(today, 24 * i + 14); // afternoon games

      if (gameDate >= start && gameDate <= end) {
        const mockGame = {
          id: `${i + 100}`, // Convert to string
          homeTeam: {
            id: "1",
            name: "Lions FC",
            appearance: { color: "blue", isVisible: true },
          },
          awayTeam: {
            id: "2",
            name: "Tigers United",
            appearance: { color: "orange", isVisible: true },
          },
          status: gameStatuses[Math.floor(Math.random() * gameStatuses.length)],
          type: "league",
          homeScore: i > 0 ? null : Math.floor(Math.random() * 5),
          awayScore: i > 0 ? null : Math.floor(Math.random() * 5),
          location: { id: "1", name: "City Stadium", address: "123 Main St" },
          startTime: format(gameDate, "HH:mm"),
          date: gameDate, // Keep as Date object
          tenantId: "1",
          seasonId: "1",
          notes:
            i % 3 === 0 ? "Important match against a rival team." : undefined,
        } as unknown as Game;

        mockEvents.push({
          id: `game-${i + 100}`,
          type: "game",
          title: `${mockGame.homeTeam?.name} vs ${mockGame.awayTeam?.name}`,
          start: gameDate,
          end: addHours(gameDate, 2),
          color: "blue",
          data: mockGame,
        });
      }
    }

    // Training events
    for (let i = -3; i < 20; i++) {
      // Skip some days to avoid having training every day
      if (i % 2 === 0) continue;

      const trainingDate = addHours(today, 24 * i + 18); // evening trainings

      if (trainingDate >= start && trainingDate <= end) {
        const mockTraining = {
          id: `${i + 200}`, // Convert to string
          date: trainingDate,
          startTime: format(trainingDate, "HH:mm"),
          endTime: format(addHours(trainingDate, 1.5), "HH:mm"),
          location: {
            id: "2",
            name: "Training Ground",
            address: "456 Park Ave",
          },
          teamId: "1",
          tenantId: "1",
          team: {
            id: "1",
            name: "Lions FC",
            appearance: { color: "blue", isVisible: true },
          },
          trainingSeasonConnections: [
            {
              id: "1",
              trainingId: `${i + 200}`,
              seasonId: "1",
              tenantId: "1",
              season: {
                id: "1",
                startDate: new Date(),
                endDate: new Date(),
                isActive: true,
                customName: "Season 2023-2024",
                breaks: [],
                phases: null,
              },
            },
          ],
        } as unknown as Training;

        mockEvents.push({
          id: `training-${i + 200}`,
          type: "training",
          title: `${mockTraining.team?.name} Training`,
          start: trainingDate,
          end: addHours(trainingDate, 1.5),
          color: "green",
          data: mockTraining,
        });
      }
    }

    return mockEvents;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setIsCreateFormOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Simple filter component */}
      <SimpleFilter
        events={events}
        onFilteredEventsChange={setFilteredEvents}
        dateRange={dateRange}
      />

      {/* Main calendar component */}
      <Card>
        <CardContent className="pt-6">
          <EventCalendar
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateRangeChange={handleDateRangeChange}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Event details dialog */}
      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          isOpen={isEventDetailsOpen}
          onClose={() => setIsEventDetailsOpen(false)}
          onEdit={handleEventEdit}
          onDelete={handleEventDelete}
        />
      )}

      {/* Event creation dialog */}
      <ResponsiveSheet
        isOpen={isCreateFormOpen}
        setIsOpen={setIsCreateFormOpen}
        title="Create Event"
      >
        <div className="space-y-4 p-4">
          <p className="text-sm text-muted-foreground">
            Event creation form would go here in a real app.
          </p>
          <Button onClick={() => setIsCreateFormOpen(false)}>Close</Button>
        </div>
      </ResponsiveSheet>
    </div>
  );
}
