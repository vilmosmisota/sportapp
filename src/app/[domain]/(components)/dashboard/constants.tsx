import React from "react";
import {
  Building2,
  UserRound,
  Dumbbell,
  BarChart3,
  GraduationCap,
  LayoutDashboard,
  Globe,
  Hammer,
  ShieldCheck,
  ClipboardCheck,
  Users2,
  Swords,
  Calendar,
  Cog,
  Trophy,
  CalendarCheck,
  History,
  LineChart,
  Newspaper,
  Home,
  CalendarDays,
  SunSnow,
  Users,
  CalendarCheck2,
  ClipboardList,
  Activity,
  CalendarClock,
  ClipboardPen,
  Signal,
  Archive,
  LibraryBig,
} from "lucide-react";
import { Permission } from "../../../../entities/role/Role.permissions";

export const ICON_MAP = {
  Globe,
  LayoutDashboard,
  Hammer,
  Building2,
  GraduationCap,
  Users2,
  UserRound,
  ShieldCheck,
  Dumbbell,
  ClipboardCheck,
  BarChart3,
  Swords,
  Calendar,
  Cog,
  Trophy,
  CalendarCheck,
  LineChart,
  History,
  Newspaper,
  Home,
  CalendarDays,
  SunSnow,
  Users,
  CalendarCheck2,
  ClipboardList,
  Activity,
  CalendarClock,
  ClipboardPen,
  Signal,
  Archive,
  LibraryBig,
};

export interface NavItem {
  id: number;
  name: string;
  href: string;
  iconName: string;
  description?: string;
  permissions: Permission[];
  disabled?: boolean;
  disabledReason?: string;
  pinnable?: boolean;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

export const getIcon = (iconName: string): React.ReactNode => {
  const Icon = ICON_MAP[iconName as keyof typeof ICON_MAP];
  return Icon ? <Icon className="h-4 w-4" /> : null;
};
