import { differenceInDays, format } from "date-fns";
import { Season } from "./Season.schema";

export function formatSeasonDateRange(season: Season): string {
  const startDate = season.startDate;
  const endDate = season.endDate;
  const bothSameYear = startDate.getFullYear() === endDate.getFullYear();

  // If both dates are in the same year, only show the year once
  if (bothSameYear) {
    return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
  }

  // If different years, show full dates
  return `${format(startDate, "MMM d, yyyy")} - ${format(
    endDate,
    "MMM d, yyyy"
  )}`;
}

export function getSeasonInfo(season: Season) {
  const today = new Date();
  const totalDays = differenceInDays(season.endDate, season.startDate);
  const daysLeft = differenceInDays(season.endDate, today);
  const daysPassed = totalDays - daysLeft;
  const percentComplete = Math.min(
    100,
    Math.round((daysPassed / totalDays) * 100)
  );

  return {
    totalDays,
    daysLeft: Math.max(0, daysLeft),
    percentComplete,
  };
}
