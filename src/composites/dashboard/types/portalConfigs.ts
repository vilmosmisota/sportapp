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
  [PortalType.KIOSK]: {
    type: PortalType.KIOSK,
    title: "Check-in Hub",
    description: "Quick and efficient attendance tracking for all activities",
    icon: ClipboardCheck,
    requiredAccess: [Access.KIOSK, Access.SYSTEM],
  },
};

export const getPortalConfig = (portalType: PortalType): PortalConfig => {
  return PORTAL_CONFIGS[portalType];
};

export const getPortalTypeFromPath = (pathname: string) => {
  if (pathname.startsWith("/management")) return PortalType.MANAGEMENT;
  if (pathname.startsWith("/kiosk")) return PortalType.KIOSK;
};

export const PORTAL_STORAGE_KEYS = {
  [PortalType.MANAGEMENT]: {
    sidebarCollapsed: "dashboard.management.sidebar.collapsed",
    pinnedItems: "dashboard.management.pinnedItems",
  },

  [PortalType.KIOSK]: {
    sidebarCollapsed: "dashboard.kiosk.sidebar.collapsed",
    pinnedItems: "dashboard.kiosk.pinnedItems",
  },
} as const;
