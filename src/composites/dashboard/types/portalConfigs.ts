import { Access } from "@/entities/role/Role.schema";
import { Calendar, ClipboardCheck, NotebookTabs, Users } from "lucide-react";
import { PortalConfig, PortalType } from "./baseDashboard.types";

export const PORTAL_CONFIGS: Record<PortalType, PortalConfig> = {
  [PortalType.MANAGEMENT]: {
    type: PortalType.MANAGEMENT,
    title: "Management",
    description: "Comprehensive management tools for your organization",
    icon: NotebookTabs,
    requiredAccess: [Access.MANAGEMENT, Access.SYSTEM],
  },
  [PortalType.SCHEDULING]: {
    type: PortalType.SCHEDULING,
    title: "Scheduling",
    description: "Manage seasons, calendar, and scheduling settings",
    icon: Calendar,
    requiredAccess: [Access.MANAGEMENT, Access.SYSTEM],
  },
  [PortalType.ATTENDANCE]: {
    type: PortalType.ATTENDANCE,
    title: "Attendance",
    description: "Attendance tracking for all activities",
    icon: ClipboardCheck,
    requiredAccess: [Access.ATTENDANCE, Access.SYSTEM],
  },
  [PortalType.USERS]: {
    type: PortalType.USERS,
    title: "Users",
    description: "Manage your users",
    icon: Users,
    requiredAccess: [],
  },
};

export const getPortalConfig = (portalType: PortalType): PortalConfig => {
  return PORTAL_CONFIGS[portalType];
};

export const getPortalTypeFromPath = (pathname: string) => {
  if (pathname.startsWith("/management")) return PortalType.MANAGEMENT;
  if (pathname.startsWith("/scheduling")) return PortalType.SCHEDULING;
  if (pathname.startsWith("/attendance")) return PortalType.ATTENDANCE;
  if (pathname.startsWith("/users")) return PortalType.USERS;
};
