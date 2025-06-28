import { Tenant } from "@/entities/tenant/Tenant.schema";
import {
  BaseNavSection,
  PortalType,
  UsePortalNavigationReturn,
} from "../types/baseDashboard.types";
import { getTopRightNavConfig } from "../utils/topRightNavConfigs";
import { usePortalNavigation } from "./usePortalNavigation";

// Attendance specific navigation sections
function getAttendanceNavSections(tenant?: Tenant): BaseNavSection[] {
  return [
    {
      section: "Default",
      items: [
        {
          id: 1,
          name: "Dashboard",
          href: "/attendance",
          iconName: "LayoutDashboard",
          description: "Main dashboard for attendance",
          permissions: [],
          pinnable: true,
        },
      ],
    },

    {
      section: "",
      items: [
        {
          id: 1,
          name: "Dashboard",
          href: "/attendance",
          iconName: "LayoutDashboard",
          description: "Manage attendance for all sessions",
          permissions: [],
          pinnable: false,
        },
        {
          id: 2,
          name: "Live sessions",
          href: "/attendance/live-sessions",
          iconName: "Activity",
          description: "View and manage active training sessions",
          permissions: [],
          pinnable: false,
        },
        {
          id: 3,
          name: "Reports",
          href: "/attendance/reports",
          iconName: "BarChart3",
          description: "View attendance reports",
          permissions: [],
          pinnable: false,
        },
        {
          id: 4,
          name: "Settings",
          href: "/attendance/settings",
          iconName: "Settings2",
          description: "Manage attendance settings",
          permissions: [],
          pinnable: false,
        },
      ],
    },
    // {
    //   section: "Check-in",
    //   items: [
    //     {
    //       id: 10,
    //       name: "Quick Check-in",
    //       href: "/attendance/check-in",
    //       iconName: "ClipboardCheck",
    //       description: "Fast check-in for participants",
    //       permissions: [],
    //       pinnable: true,
    //     },
    //     {
    //       id: 11,
    //       name: "Group Check-in",
    //       href: "/attendance/group-check-in",
    //       iconName: "Users2",
    //       description: "Check-in multiple participants at once",
    //       permissions: [],
    //       pinnable: true,
    //     },
    //     {
    //       id: 12,
    //       name: "Event Check-in",
    //       href: "/attendance/event-check-in",
    //       iconName: "CalendarCheck",
    //       description: "Check-in for specific events or sessions",
    //       permissions: [],
    //       pinnable: false,
    //     },
    //   ],
    // },
    // {
    //   section: "Attendance",
    //   items: [
    //     {
    //       id: 20,
    //       name: "Live Sessions",
    //       href: "/attendance/live-sessions",
    //       iconName: "Activity",
    //       description: "View and manage active training sessions",
    //       permissions: [],
    //       pinnable: true,
    //     },
    //     {
    //       id: 21,
    //       name: "Attendance List",
    //       href: "/attendance/attendance-list",
    //       iconName: "ClipboardList",
    //       description: "View current attendance for all sessions",
    //       permissions: [],
    //       pinnable: true,
    //     },
    //     {
    //       id: 22,
    //       name: "Late Arrivals",
    //       href: "/attendance/late-arrivals",
    //       iconName: "Clock",
    //       description: "Manage late check-ins and exceptions",
    //       permissions: [],
    //       pinnable: false,
    //     },
    //   ],
    // },
    // {
    //   section: "Reports",
    //   items: [
    //     {
    //       id: 30,
    //       name: "Daily Summary",
    //       href: "/attendance/daily-summary",
    //       iconName: "BarChart3",
    //       description: "View daily attendance summary",
    //       permissions: [Permission.VIEW_ATTENDANCE],
    //       pinnable: false,
    //     },
    //     {
    //       id: 31,
    //       name: "Session Reports",
    //       href: "/attendance/session-reports",
    //       iconName: "LineChart",
    //       description: "Detailed session attendance reports",
    //       permissions: [Permission.VIEW_ATTENDANCE],
    //       pinnable: false,
    //     },
    //   ],
    // },
    // {
    //   section: "Administration",
    //   items: [
    //     {
    //       id: 40,
    //       name: "Attendance Settings",
    //       href: "/attendance/settings",
    //       iconName: "Cog",
    //       description: "Configure attendance preferences and display options",
    //       permissions: [Permission.MANAGE_ORGANIZATION], // Requires organization management permission
    //       pinnable: false,
    //     },
    //     {
    //       id: 41,
    //       name: "Device Status",
    //       href: "/attendance/device-status",
    //       iconName: "Monitor",
    //       description: "Monitor attendance device health and connectivity",
    //       permissions: [Permission.MANAGE_ORGANIZATION],
    //       pinnable: false,
    //     },
    //   ],
    // },
  ];
}

// Attendance specific top right navigation config
function getAttendanceTopRightNavConfig(tenant?: Tenant) {
  const domain = "attendance"; // This would be dynamic in real implementation
  return getTopRightNavConfig(PortalType.ATTENDANCE, domain);
}

// Attendance navigation hook
export function useAttendanceNavigation(
  tenant?: Tenant
): UsePortalNavigationReturn {
  return usePortalNavigation(
    PortalType.ATTENDANCE,
    getAttendanceNavSections,
    getAttendanceTopRightNavConfig
  );
}
