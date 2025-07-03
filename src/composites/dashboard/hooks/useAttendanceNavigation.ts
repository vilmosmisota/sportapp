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
      section: "",
      items: [
        {
          id: 0,
          name: "Overview",
          href: "/attendance",
          iconName: "LayoutDashboard",
          description: "Attendance overview and dashboard",
          permissions: [],
          pinnable: false,
        },
        {
          id: 1,
          name: "Live sessions",
          href: "/attendance/live-sessions",
          iconName: "Activity",
          description: "View and manage active training sessions",
          permissions: [],
          pinnable: true,
        },
        {
          id: 2,
          name: "Reports",
          href: "/attendance/reports",
          iconName: "BarChart3",
          description: "View attendance reports",
          permissions: [],
          pinnable: true,
        },
        {
          id: 3,
          name: "Settings",
          href: "/attendance/settings",
          iconName: "Settings2",
          description: "Manage attendance settings",
          permissions: [],
          pinnable: false,
        },
      ],
    },
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
