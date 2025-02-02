import { format } from "date-fns";
import { SessionData, DayOfWeekStats } from "../types";

export const calculateAttendanceRate = (
  present: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
};

export const calculateOnTimeRate = (present: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
};

export const calculateLateArrivalRate = (
  late: number,
  present: number
): number => {
  const total = present + late;
  if (total === 0) return 0;
  return Math.round((late / total) * 100);
};

export const formatRecentTrendData = (sessions: SessionData[]) => {
  return sessions.map((session) => ({
    date: session.date,
    dateFormatted: format(new Date(session.date), "MMM d"),
    attendance: session.attendanceRate,
    playersPresent: session.playersPresent,
    totalPlayers: session.totalPlayers,
  }));
};

export const calculateDayOfWeekStats = (
  sessions: SessionData[]
): DayOfWeekStats[] => {
  const dayStats = new Map<
    string,
    { total: number; present: number; players: number }
  >();

  sessions.forEach((session) => {
    const day = format(new Date(session.date), "EEE");
    const existing = dayStats.get(day) || { total: 0, present: 0, players: 0 };

    dayStats.set(day, {
      total: existing.total + 1,
      present: existing.present + session.playersPresent,
      players: existing.players + session.totalPlayers,
    });
  });

  return Array.from(dayStats.entries()).map(([dayOfWeek, stats]) => ({
    dayOfWeek,
    attendanceRate: calculateAttendanceRate(stats.present, stats.players),
    averagePlayersPresent: Math.round(stats.present / stats.total),
  }));
};

export const calculateConsecutiveFullAttendance = (sessions: SessionData[]) => {
  return sessions.reduce(
    (acc: { current: number; max: number }, session) => {
      const isFullAttendance = session.playersPresent === session.totalPlayers;
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
