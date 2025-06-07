import { format } from "date-fns";
import { SessionData, DayOfWeekStats } from "../types";

export const calculateAttendanceRate = (
  present: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
};

export const calculateOnTimeRate = (
  onTime: number,
  attended: number
): number => {
  if (attended === 0) return 0;
  return Math.round((onTime / attended) * 100);
};

export const calculateLateArrivalRate = (
  late: number,
  onTime: number
): number => {
  const total = onTime + late;
  if (total === 0) return 0;
  return Math.round((late / total) * 100);
};

export const formatRecentTrendData = (sessions: SessionData[]) => {
  return sessions.map((session) => {
    // Ensure we have the correct values for calculations
    const onTimeCount = session.onTimeCount || 0;
    const lateCount = session.lateCount || 0;
    const absentCount = session.absentCount || 0;

    // Calculate total players and players present
    const totalPlayers = onTimeCount + lateCount + absentCount;
    const playersPresent = onTimeCount + lateCount;

    // Calculate attendance rate: (onTime + late) / total
    const attendanceRate =
      totalPlayers > 0
        ? Math.min(100, Math.round((playersPresent / totalPlayers) * 100))
        : 0;

    // Calculate accuracy rate: onTime / (onTime + late)
    const totalAttended = onTimeCount + lateCount;
    const accuracyRate =
      totalAttended > 0
        ? Math.min(100, Math.round((onTimeCount / totalAttended) * 100))
        : 0;

    return {
      date: session.date,
      dateFormatted: format(new Date(session.date), "MMM d"),
      attendance: attendanceRate,
      accuracy: accuracyRate,
      playersPresent: playersPresent,
      totalPlayers: totalPlayers,
    };
  });
};

export const calculateDayOfWeekStats = (
  sessions: SessionData[]
): DayOfWeekStats[] => {
  // Group sessions by day
  const dayStats = new Map<
    string,
    {
      total: number;
      onTime: number;
      late: number;
      players: number;
      sessions: number;
    }
  >();

  // Process each session
  sessions.forEach((session) => {
    const day = format(new Date(session.date), "EEE");
    const existing = dayStats.get(day) || {
      total: 0,
      onTime: 0,
      late: 0,
      players: 0,
      sessions: 0,
    };

    const onTimeCount = session.onTimeCount || 0;
    const lateCount = session.lateCount || 0;
    const absentCount = session.absentCount || 0;
    const totalPlayers = onTimeCount + lateCount + absentCount;

    dayStats.set(day, {
      total: existing.total + totalPlayers,
      onTime: existing.onTime + onTimeCount,
      late: existing.late + lateCount,
      players: existing.players + totalPlayers,
      sessions: existing.sessions + 1,
    });
  });

  // Get today's day of week
  const today = format(new Date(), "EEE");

  // Calculate stats for each day
  const result = Array.from(dayStats.entries()).map(([day, stats]) => {
    // Calculate attendance rate: (onTime + late) / total
    const attendanceRate =
      stats.total > 0
        ? Math.min(
            100,
            Math.round(((stats.onTime + stats.late) / stats.total) * 100)
          )
        : 0;

    // Calculate accuracy rate: onTime / (onTime + late)
    const totalAttended = stats.onTime + stats.late;
    const accuracyRate =
      totalAttended > 0
        ? Math.min(100, Math.round((stats.onTime / totalAttended) * 100))
        : 0;

    return {
      dayOfWeek: day,
      attendanceRate: attendanceRate,
      accuracy: accuracyRate,
      averagePlayersPresent: Math.round(
        (stats.onTime + stats.late) / stats.sessions
      ),
    };
  });

  return result;
};

export const calculateConsecutiveFullAttendance = (sessions: SessionData[]) => {
  return sessions.reduce(
    (acc: { current: number; max: number }, session) => {
      // Calculate total players and players present
      const onTimeCount = session.onTimeCount || 0;
      const lateCount = session.lateCount || 0;
      const absentCount = session.absentCount || 0;
      const totalPlayers = onTimeCount + lateCount + absentCount;
      const playersPresent = onTimeCount + lateCount;

      const isFullAttendance = playersPresent === totalPlayers;
      if (isFullAttendance) {
        acc.current++;
        acc.max = Math.max(acc.max, acc.current);
      } else {
        acc.current = 0;
      }
      return acc;
    },
    { current: 0, max: 0 }
  ).max;
};
