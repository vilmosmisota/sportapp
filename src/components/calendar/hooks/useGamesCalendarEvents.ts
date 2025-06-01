import { useQuery } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { Game } from "@/entities/game/Game.schema";
import { CalendarEvent } from "../EventCalendar";
import { Appearance } from "@/entities/shared/Appearance.schema";
import {
  getDisplayAgeGroup,
  getDisplayGender,
} from "@/entities/group/Group.schema";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { getGamesWithDetailsByDateRange } from "@/entities/game/Game.services";
import { queryKeys } from "@/cacheKeys/cacheKeys";
import { Meta } from "@/entities/shared/Meta.schema";

// Extended Game type to include the properties from our SQL view
export interface GameWithViewDetails extends Game {
  competitionType?: string | null;
  meta?: Meta;
  tenantTeam?: {
    id: number;
    age: number;
    gender: string;
    name: string;
    tenantId: number;
    isHomeTeam: boolean;
    skill?: string;
    appearance?: Appearance;
  };
  opponentTeam?: {
    id: number;
    age: number;
    gender: string;
    name: string;
    opponentId: number;
    tenantId: number;
    isHomeTeam: boolean;
    skill?: string;
    appearance?: Appearance;
  };
}

// Helper function to format team details from the view structure
function formatTeamDetails(team: any) {
  if (!team) return "";

  const ageGroup = getDisplayAgeGroup(team.age) || "";
  const gender = getDisplayGender(team.gender, team.age) || "";
  const skill = team.skill || "";

  return [ageGroup, gender, skill].filter(Boolean).join(" • ");
}

// Helper function to parse competition type string (format: "League#D9F99D")
function parseCompetitionType(competitionType: string | null | undefined) {
  if (!competitionType) return { name: "", color: "" };

  const parts = competitionType.split("#");
  return {
    name: parts[0] || "",
    color: parts.length > 1 ? `#${parts[1]}` : "",
  };
}

// Simplified transformer function that leverages the SQL view structure
export const transformGamesToEvents = (
  games: GameWithViewDetails[] = [],
  tenantName: string = "Our Team"
): CalendarEvent[] => {
  return games.map((game) => {
    try {
      // Handle date properly
      const gameDate =
        typeof game.date === "string" ? new Date(game.date) : game.date;

      // Get the time part only (remove seconds if present)
      const startTime = game.startTime.substring(0, 5); // Extract HH:mm from HH:mm:ss

      // Create start time by combining date and start time
      const startDateTime = parse(
        `${format(gameDate, "yyyy-MM-dd")} ${startTime}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );

      // Default game duration is 2 hours if endTime is not provided
      let endDateTime;
      if (game.endTime) {
        const endTime = game.endTime.substring(0, 5); // Extract HH:mm from HH:mm:ss
        endDateTime = parse(
          `${format(gameDate, "yyyy-MM-dd")} ${endTime}`,
          "yyyy-MM-dd HH:mm",
          new Date()
        );
      } else {
        // Use exactly 2 hours - don't add seconds or milliseconds
        endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + 2);
        endDateTime.setMinutes(startDateTime.getMinutes());
        endDateTime.setSeconds(0);
        endDateTime.setMilliseconds(0);
      }

      // Parse competition type (if any)
      const competition = parseCompetitionType(game.competitionType);

      // Generate title based on the view structure
      let title = "Game";
      let homeTeamInfo = { name: "Home", color: "blue", details: "" };
      let awayTeamInfo = { name: "Away", color: "red", details: "" };

      // The view gives us direct access to tenant and opponent team information
      const tenantTeam = game.tenantTeam;
      const opponentTeam = game.opponentTeam;

      if (tenantTeam && opponentTeam) {
        // Determine which team is home and which is away
        const isTenantHome = tenantTeam.isHomeTeam;

        if (isTenantHome) {
          homeTeamInfo = {
            name: tenantName,
            color: tenantTeam.appearance?.color || "#1a73e8",
            details: formatTeamDetails(tenantTeam),
          };
          awayTeamInfo = {
            name: opponentTeam.name || "Opponent",
            color: opponentTeam.appearance?.color || "#e53935",
            details: formatTeamDetails(opponentTeam),
          };
        } else {
          homeTeamInfo = {
            name: opponentTeam.name || "Opponent",
            color: opponentTeam.appearance?.color || "#e53935",
            details: formatTeamDetails(opponentTeam),
          };
          awayTeamInfo = {
            name: tenantName,
            color: tenantTeam.appearance?.color || "#1a73e8",
            details: formatTeamDetails(tenantTeam),
          };
        }

        title = `${homeTeamInfo.name} vs ${awayTeamInfo.name}`;
      } else if (tenantTeam) {
        homeTeamInfo = {
          name: tenantName,
          color: tenantTeam.appearance?.color || "#1a73e8",
          details: formatTeamDetails(tenantTeam),
        };
        title = `${homeTeamInfo.name} vs TBD`;
      } else if (opponentTeam) {
        homeTeamInfo = {
          name: opponentTeam.name || "Opponent",
          color: opponentTeam.appearance?.color || "#e53935",
          details: formatTeamDetails(opponentTeam),
        };
        title = `${homeTeamInfo.name} vs TBD`;
      }

      // Use competition color if available, otherwise fall back to home team color
      const primaryColor = competition.color || homeTeamInfo.color;

      return {
        id: `game-${game.id}`,
        type: "game",
        title,
        start: startDateTime,
        end: endDateTime,
        color: primaryColor,
        data: {
          ...game,
          displayDetails: {
            homeTeam: homeTeamInfo,
            awayTeam: awayTeamInfo,
            competition: competition,
            detailsText: `${homeTeamInfo.details || ""} vs ${
              awayTeamInfo.details || ""
            }`.trim(),
          },
        },
      };
    } catch (error) {
      console.error("Error transforming game to event:", error, game);
      // Return a fallback event
      return {
        id: `game-${game.id || "unknown"}`,
        type: "game",
        title: "Game (error)",
        start: new Date(),
        end: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        color: "red", // Indicate error with red
        data: game,
      };
    }
  });
};

/**
 * Simplified hook to fetch and transform games into calendar events for a given month
 */
export function useGamesCalendarEvents(
  tenantId: string,
  startDate: Date, // First day of month
  endDate: Date, // Last day of month
  seasonId: number,
  enabled = true,
  tenantName: string = "Our Team"
) {
  // Make sure we use a consistent format for the query key
  const monthKey = format(startDate, "yyyy-MM");

  // Use the properly defined query key from the central cache keys file
  const queryKey = queryKeys.game.calendarEvents(tenantId, monthKey, seasonId);

  // Get the Supabase client
  const client = useSupabase();

  return useQuery({
    queryKey,
    queryFn: async () => {
      return await getGamesWithDetailsByDateRange(
        client,
        tenantId,
        startDate,
        endDate,
        seasonId
      );
    },
    select: (games) => transformGamesToEvents(games, tenantName),
    enabled: enabled && !!seasonId && !!tenantId,
  });
}
