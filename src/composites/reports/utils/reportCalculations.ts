import { AttendanceSessionAggregateWithGroup } from "@/entities/reports/AttendanceReport.schemas";
import { format } from "date-fns";

/**
 * Calculate trend by comparing first half vs second half of recent sessions
 */
export const calculateAttendanceTrend = (
  sessions: Array<{
    onTimeCount: number;
    lateCount: number;
    absentCount: number;
    date: string;
  }>
): "up" | "down" | "stable" => {
  if (sessions.length < 4) return "stable";

  const midPoint = Math.floor(sessions.length / 2);
  const firstHalf = sessions.slice(0, midPoint);
  const secondHalf = sessions.slice(midPoint);

  const firstHalfAvg =
    firstHalf.reduce((sum, session) => {
      const total =
        session.onTimeCount + session.lateCount + session.absentCount;
      return (
        sum +
        (total > 0
          ? ((session.onTimeCount + session.lateCount) / total) * 100
          : 0)
      );
    }, 0) / firstHalf.length;

  const secondHalfAvg =
    secondHalf.reduce((sum, session) => {
      const total =
        session.onTimeCount + session.lateCount + session.absentCount;
      return (
        sum +
        (total > 0
          ? ((session.onTimeCount + session.lateCount) / total) * 100
          : 0)
      );
    }, 0) / secondHalf.length;

  const difference = secondHalfAvg - firstHalfAvg;
  if (difference > 5) return "up";
  if (difference < -5) return "down";
  return "stable";
};

/**
 * Calculate average session size
 */
export const calculateAverageSessionSize = (
  totalOnTime: number,
  totalLate: number,
  totalAbsent: number,
  totalSessions: number
): number => {
  const totalAttendances = totalOnTime + totalLate + totalAbsent;
  return totalAttendances / totalSessions;
};

/**
 * Calculate on-time rate
 */
export const calculateOnTimeRate = (
  totalOnTime: number,
  totalLate: number
): number => {
  return totalOnTime + totalLate > 0
    ? (totalOnTime / (totalOnTime + totalLate)) * 100
    : 0;
};

/**
 * Calculate consistency score based on session attendance variation
 */
export const calculateConsistencyScore = (
  sessions: Array<{
    onTimeCount: number;
    lateCount: number;
    absentCount: number;
  }>
): number => {
  if (sessions.length <= 1) return 100;

  const variation =
    sessions.reduce((acc, session, i) => {
      if (i === 0) return acc;
      const prevTotal =
        sessions[i - 1].onTimeCount +
        sessions[i - 1].lateCount +
        sessions[i - 1].absentCount;
      const currTotal =
        session.onTimeCount + session.lateCount + session.absentCount;
      return acc + Math.abs(currTotal - prevTotal);
    }, 0) /
    (sessions.length - 1);

  return Math.max(0, 100 - variation * 5);
};

/**
 * Format recent trend data for line charts
 */
export const formatTrendData = (
  sessions: Array<{
    onTimeCount: number;
    lateCount: number;
    absentCount: number;
    date: string;
  }>
) => {
  return sessions.map((session) => {
    const sessionTotal =
      session.onTimeCount + session.lateCount + session.absentCount;
    const sessionAttendanceRate =
      sessionTotal > 0
        ? ((session.onTimeCount + session.lateCount) / sessionTotal) * 100
        : 0;
    const sessionOnTimeRate =
      session.onTimeCount + session.lateCount > 0
        ? (session.onTimeCount / (session.onTimeCount + session.lateCount)) *
          100
        : 0;

    return {
      date: session.date,
      dateFormatted: format(new Date(session.date), "dd MMM"),
      attendance: Math.round(sessionAttendanceRate * 100) / 100,
      onTime: Math.round(sessionOnTimeRate * 100) / 100,
      present: session.onTimeCount,
      late: session.lateCount,
      absent: session.absentCount,
    };
  });
};

/**
 * Calculate day of week performance statistics
 */
export const calculateDayOfWeekStats = (
  sessions: Array<{
    onTimeCount: number;
    lateCount: number;
    absentCount: number;
    date: string;
  }>
) => {
  const dayOfWeekStats = sessions.reduce(
    (
      acc: Record<
        string,
        { total: number; onTime: number; late: number; absent: number }
      >,
      session
    ) => {
      const day = format(new Date(session.date), "EEE");
      if (!acc[day]) {
        acc[day] = { total: 0, onTime: 0, late: 0, absent: 0 };
      }
      acc[day].total++;
      acc[day].onTime += session.onTimeCount;
      acc[day].late += session.lateCount;
      acc[day].absent += session.absentCount;
      return acc;
    },
    {}
  );

  return Object.entries(dayOfWeekStats).map(([day, data]) => {
    const totalAttendees = data.onTime + data.late + data.absent;
    const attendanceRate =
      totalAttendees > 0
        ? ((data.onTime + data.late) / totalAttendees) * 100
        : 0;
    const onTimeRate =
      data.onTime + data.late > 0
        ? (data.onTime / (data.onTime + data.late)) * 100
        : 0;

    return {
      day,
      attendance: Math.round(attendanceRate * 100) / 100,
      onTime: Math.round(onTimeRate * 100) / 100,
    };
  });
};

/**
 * Calculate risk score for a group
 */
export const calculateRiskScore = (
  group: AttendanceSessionAggregateWithGroup
): number => {
  const attendanceRate = group.averageAttendanceRate;
  const recentSessions = group.sessions.slice(-5);

  // Calculate trend
  const midPoint = Math.floor(recentSessions.length / 2);
  const firstHalf = recentSessions.slice(0, midPoint);
  const secondHalf = recentSessions.slice(midPoint);

  const firstHalfAvg =
    firstHalf.length > 0
      ? firstHalf.reduce((sum, session) => {
          const total =
            session.onTimeCount + session.lateCount + session.absentCount;
          return (
            sum +
            (total > 0
              ? ((session.onTimeCount + session.lateCount) / total) * 100
              : 0)
          );
        }, 0) / firstHalf.length
      : 0;

  const secondHalfAvg =
    secondHalf.length > 0
      ? secondHalf.reduce((sum, session) => {
          const total =
            session.onTimeCount + session.lateCount + session.absentCount;
          return (
            sum +
            (total > 0
              ? ((session.onTimeCount + session.lateCount) / total) * 100
              : 0)
          );
        }, 0) / secondHalf.length
      : 0;

  const trendScore = firstHalfAvg > secondHalfAvg ? 20 : 0; // Declining trend adds risk
  const lowAttendanceScore = attendanceRate < 70 ? 70 - attendanceRate : 0;

  return Math.min(100, trendScore + lowAttendanceScore);
};
