import { LucideIcon } from "lucide-react";
import { Team } from "@/entities/team/Team.schema";
import {
  RecentTrend,
  DayOfWeekStats,
  TeamAttendanceStats,
} from "@/entities/attendance/Attendance.schema";

export interface TeamCardProps {
  team: Team;
  tenantId: string;
  seasonId: string;
}

export interface StatItemProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  className?: string;
}

export interface SessionData {
  date: string;
  playersPresent: number;
  totalPlayers: number;
  attendanceRate: number;
}

export type { RecentTrend as TrendData, DayOfWeekStats, TeamAttendanceStats };
