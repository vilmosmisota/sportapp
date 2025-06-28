import { Access } from "@/entities/role/Role.schema";
import { ClipboardCheck, NotebookTabs } from "lucide-react";
import { PortalConfig, PortalType } from "./baseDashboard.types";

export const PORTAL_CONFIGS: Record<PortalType, PortalConfig> = {
  [PortalType.MANAGEMENT]: {
    type: PortalType.MANAGEMENT,
    title: "Management",
    description: "Comprehensive management tools for your organization",
    icon: NotebookTabs,
    requiredAccess: [Access.MANAGEMENT, Access.SYSTEM],
  },
  [PortalType.ATTENDANCE]: {
    type: PortalType.ATTENDANCE,
    title: "Attendance",
    description: "Attendance tracking for all activities",
    icon: ClipboardCheck,
    requiredAccess: [Access.ATTENDANCE, Access.SYSTEM],
  },
};

export const getPortalConfig = (portalType: PortalType): PortalConfig => {
  return PORTAL_CONFIGS[portalType];
};

export const getPortalTypeFromPath = (pathname: string) => {
  if (pathname.startsWith("/management")) return PortalType.MANAGEMENT;
  if (pathname.startsWith("/attendance")) return PortalType.ATTENDANCE;
};

export const PORTAL_STORAGE_KEYS = {
  [PortalType.MANAGEMENT]: {
    sidebarCollapsed: "dashboard.management.sidebar.collapsed",
    pinnedItems: "dashboard.management.pinnedItems",
  },

  [PortalType.ATTENDANCE]: {
    sidebarCollapsed: "dashboard.attendance.sidebar.collapsed",
    pinnedItems: "dashboard.attendance.pinnedItems",
  },
} as const;
