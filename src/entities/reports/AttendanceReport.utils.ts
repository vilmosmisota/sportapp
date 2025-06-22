import { AttendanceSessionAggregateWithGroup } from "./AttendanceReport.schemas";

/**
 * Calculate overall attendance statistics across all groups for a season
 */
export const calculateSeasonOverallStats = (
  sessionAggregates: AttendanceSessionAggregateWithGroup[]
) => {
  if (!sessionAggregates.length) {
    return {
      totalSessions: 0,
      totalOnTime: 0,
      totalLate: 0,
      totalAbsent: 0,
      averageAttendanceRate: 0,
      totalGroups: 0,
    };
  }

  const totals = sessionAggregates.reduce(
    (acc, aggregate) => ({
      totalSessions: acc.totalSessions + aggregate.totalSessions,
      totalOnTime: acc.totalOnTime + aggregate.totalOnTime,
      totalLate: acc.totalLate + aggregate.totalLate,
      totalAbsent: acc.totalAbsent + aggregate.totalAbsent,
    }),
    { totalSessions: 0, totalOnTime: 0, totalLate: 0, totalAbsent: 0 }
  );

  const totalAttendances =
    totals.totalOnTime + totals.totalLate + totals.totalAbsent;
  const averageAttendanceRate =
    totalAttendances > 0
      ? ((totals.totalOnTime + totals.totalLate) / totalAttendances) * 100
      : 0;

  return {
    ...totals,
    averageAttendanceRate: Math.round(averageAttendanceRate * 100) / 100,
    totalGroups: sessionAggregates.length,
  };
};

/**
 * Format group name for display
 */
export const formatGroupName = (group: {
  customName?: string | null;
  ageRange?: string;
  level?: string | null;
  gender?: string;
}) => {
  if (group.customName) {
    return group.customName;
  }

  const parts = [
    group.ageRange,
    group.level,
    group.gender === "mixed"
      ? "Mixed"
      : group.gender === "male"
      ? "Boys"
      : group.gender === "female"
      ? "Girls"
      : group.gender,
  ].filter(Boolean);

  return parts.join(" • ");
};

/**
 * Get attendance rate color based on percentage
 */
export const getAttendanceRateColor = (rate: number) => {
  if (rate >= 90) return "text-green-600";
  if (rate >= 75) return "text-yellow-600";
  return "text-red-600";
};

/**
 * Format attendance rate as percentage
 */
export const formatAttendanceRate = (rate: number) => {
  return `${Math.round(rate * 100) / 100}%`;
};
