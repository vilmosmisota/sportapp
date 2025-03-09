import { useQuery } from "@tanstack/react-query";
import { format, parse, addHours } from "date-fns";
import { Game } from "@/entities/game/Game.schema";
import { Training } from "@/entities/training/Training.schema";
import {
  getDisplayAgeGroup,
  getDisplayGender,
} from "@/entities/team/Team.schema";
import { CalendarEvent } from "../EventCalendar";
import { useGamesFromMonthQuery } from "@/entities/game/Game.query";
import { useTrainingsForMonthQuery } from "@/entities/training/Training.query";
import { queryKeys } from "@/cacheKeys/cacheKeys";

// Stable transformer function for games
const transformGamesToEvents = (games: Game[] = []): CalendarEvent[] => {
  return games.map((game) => {
    // Handle date properly
    const gameDate =
      typeof game.date === "string" ? new Date(game.date) : game.date;
    const startTime = game.startTime;

    // Create start time by combining date and start time
    const startDateTime = parse(
      `${format(gameDate, "yyyy-MM-dd")} ${startTime}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );

    // Default game duration is 2 hours if endTime is not provided
    const endDateTime = game.endTime
      ? parse(
          `${format(gameDate, "yyyy-MM-dd")} ${game.endTime}`,
          "yyyy-MM-dd HH:mm",
          new Date()
        )
      : addHours(startDateTime, 2);

    // Generate title based on teams
    let title = "Game";
    if (game.homeTeam && game.awayTeam) {
      const homeAgeGroup = getDisplayAgeGroup(game.homeTeam.age);
      const homeGender = getDisplayGender(
        game.homeTeam.gender,
        game.homeTeam.age
      );

      // Format: "U18 Boys - Lions vs Tigers"
      if (homeAgeGroup && homeGender) {
        title = `${homeAgeGroup} ${homeGender} - `;
      }

      title += `${game.homeTeam.name || "Home"} vs ${
        game.awayTeam.name || "Away"
      }`;
    }

    const primaryColor = game.homeTeam?.appearance?.color || "blue";

    return {
      id: `game-${game.id}`,
      type: "game",
      title,
      start: startDateTime,
      end: endDateTime,
      color: primaryColor,
      data: game,
    };
  });
};

// Stable transformer function for trainings
const transformTrainingsToEvents = (
  trainings: Training[] = []
): CalendarEvent[] => {
  return trainings.map((training) => {
    // Handle date properly
    const trainingDate =
      typeof training.date === "string"
        ? new Date(training.date)
        : training.date;
    const startTime = training.startTime;

    // Create start time by combining date and start time
    const startDateTime = parse(
      `${format(trainingDate, "yyyy-MM-dd")} ${startTime}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );

    // Parse end time
    const endDateTime = parse(
      `${format(trainingDate, "yyyy-MM-dd")} ${training.endTime}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );

    // Generate title based on team
    let title = "Training";
    if (training.team) {
      const ageGroup = getDisplayAgeGroup(training.team.age);
      const gender = getDisplayGender(training.team.gender, training.team.age);
      const skill = training.team.skill || "";

      // Format with bullet points: "U18 • Boys • Beginner"
      if (ageGroup && gender) {
        if (skill) {
          title = `${ageGroup} • ${gender} • ${skill}`;
        } else {
          title = `${ageGroup} • ${gender}`;
        }
      }
    }

    const primaryColor = training.team?.appearance?.color || "green";

    return {
      id: `training-${training.id}`,
      type: "training",
      title,
      start: startDateTime,
      end: endDateTime,
      color: primaryColor,
      data: training,
    };
  });
};

// Combine games and trainings into a single array of calendar events
const combineEventsTransformer = (data: {
  games: Game[];
  trainings: Training[];
}): CalendarEvent[] => {
  const gameEvents = transformGamesToEvents(data.games);
  const trainingEvents = transformTrainingsToEvents(data.trainings);
  return [...gameEvents, ...trainingEvents];
};

export function useCalendarEvents(
  tenantId: string,
  startDate: Date,
  endDate: Date,
  seasonId: number,
  enabled = true
) {
  // Query to get games
  const gamesQuery = useGamesFromMonthQuery(
    tenantId,
    startDate,
    endDate,
    seasonId,
    enabled && !!seasonId
  );

  // Query to get trainings
  const trainingsQuery = useTrainingsForMonthQuery(
    tenantId,
    startDate,
    endDate,
    seasonId,
    enabled
  );

  // Create a query key for the combined data
  const queryKey = [
    "calendarEvents",
    tenantId,
    format(startDate, "yyyy-MM-dd"),
    format(endDate, "yyyy-MM-dd"),
    seasonId,
  ];

  // Combined query that depends on both games and trainings
  return useQuery({
    queryKey,
    // This query doesn't fetch data - it just combines the results of the other queries
    queryFn: () => ({
      games: gamesQuery.data || [],
      trainings: trainingsQuery.data || [],
    }),
    // Transform the data with our selector
    select: combineEventsTransformer,
    // Only enabled if both dependent queries are enabled
    enabled: enabled && gamesQuery.isSuccess && trainingsQuery.isSuccess,
    // Don't refetch this query independently - it depends on the other queries
    staleTime: Infinity,
    // Use placeholderData instead of keepPreviousData (renamed in newer versions)
    placeholderData: (prev) => prev,
  });
}
