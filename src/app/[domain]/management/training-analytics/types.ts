import { Team } from "@/entities/group/Group.schema";
import {
  DayOfWeekStats,
  RecentTrend,
  TeamAttendanceStats,
} from "@/entities/old-attendance/Attendance.schema";
import { LucideIcon } from "lucide-react";

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
  sessionId?: number;
  trainingId?: number;
  startTime?: string;
  endTime?: string;
  onTimeCount?: number;
  lateCount?: number;
  absentCount?: number;
}

export type { DayOfWeekStats, TeamAttendanceStats, RecentTrend as TrendData };
