import { isWithinInterval } from "date-fns";
import { Season } from "./Season.schema";

export const getCurrentSeason = (
  seasons: Season[] | undefined
): Season | undefined => {
  if (!seasons) return undefined;

  const today = new Date();

  return seasons.find((season) => {
    // Check if today's date is within the season's start and end dates
    const seasonStart = season.startDate;
    const seasonEnd = season.endDate; // Convert string to Date

    if (!isWithinInterval(today, { start: seasonStart, end: seasonEnd })) {
      return false; // Today's date is not within the season
    }

    return true;
  });
};
