import { Permission } from "@/entities/role/Role.permissions";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import {
  BaseNavSection,
  PortalType,
  UsePortalNavigationReturn,
} from "../types/baseDashboard.types";
import { getTopRightNavConfig } from "../utils/topRightNavConfigs";
import { usePortalNavigation } from "./usePortalNavigation";

// Kiosk specific navigation sections
function getKioskNavSections(tenant?: Tenant): BaseNavSection[] {
  return [
    {
      section: "Default",
      items: [
        {
          id: 1,
          name: "Check-in Hub",
          href: "/kiosk",
          iconName: "Home",
          description: "Main check-in interface",
          permissions: [], // No specific permissions required for basic kiosk access
          pinnable: true,
        },
      ],
    },
    {
      section: "Check-in",
      items: [
        {
          id: 10,
          name: "Quick Check-in",
          href: "/kiosk/check-in",
          iconName: "ClipboardCheck",
          description: "Fast check-in for participants",
          permissions: [],
          pinnable: true,
        },
        {
          id: 11,
          name: "Group Check-in",
          href: "/kiosk/group-check-in",
          iconName: "Users2",
          description: "Check-in multiple participants at once",
          permissions: [],
          pinnable: true,
        },
        {
          id: 12,
          name: "Event Check-in",
          href: "/kiosk/event-check-in",
          iconName: "CalendarCheck",
          description: "Check-in for specific events or sessions",
          permissions: [],
          pinnable: false,
        },
      ],
    },
    {
      section: "Attendance",
      items: [
        {
          id: 20,
          name: "Live Sessions",
          href: "/kiosk/live-sessions",
          iconName: "Activity",
          description: "View and manage active training sessions",
          permissions: [],
          pinnable: true,
        },
        {
          id: 21,
          name: "Attendance List",
          href: "/kiosk/attendance-list",
          iconName: "ClipboardList",
          description: "View current attendance for all sessions",
          permissions: [],
          pinnable: true,
        },
        {
          id: 22,
          name: "Late Arrivals",
          href: "/kiosk/late-arrivals",
          iconName: "Clock",
          description: "Manage late check-ins and exceptions",
          permissions: [],
          pinnable: false,
        },
      ],
    },
    {
      section: "Reports",
      items: [
        {
          id: 30,
          name: "Daily Summary",
          href: "/kiosk/daily-summary",
          iconName: "BarChart3",
          description: "View daily attendance summary",
          permissions: [Permission.VIEW_ATTENDANCE],
          pinnable: false,
        },
        {
          id: 31,
          name: "Session Reports",
          href: "/kiosk/session-reports",
          iconName: "LineChart",
          description: "Detailed session attendance reports",
          permissions: [Permission.VIEW_ATTENDANCE],
          pinnable: false,
        },
      ],
    },
    {
      section: "Administration",
      items: [
        {
          id: 40,
          name: "Kiosk Settings",
          href: "/kiosk/settings",
          iconName: "Cog",
          description: "Configure kiosk preferences and display options",
          permissions: [Permission.MANAGE_ORGANIZATION], // Requires organization management permission
          pinnable: false,
        },
        {
          id: 41,
          name: "Device Status",
          href: "/kiosk/device-status",
          iconName: "Monitor",
          description: "Monitor kiosk device health and connectivity",
          permissions: [Permission.MANAGE_ORGANIZATION],
          pinnable: false,
        },
      ],
    },
  ];
}

// Kiosk specific top right navigation config
function getKioskTopRightNavConfig(tenant?: Tenant) {
  const domain = "kiosk"; // This would be dynamic in real implementation
  return getTopRightNavConfig(PortalType.KIOSK, domain);
}

// Kiosk navigation hook
export function useKioskNavigation(tenant?: Tenant): UsePortalNavigationReturn {
  return usePortalNavigation(
    PortalType.KIOSK,
    getKioskNavSections,
    getKioskTopRightNavConfig
  );
}
