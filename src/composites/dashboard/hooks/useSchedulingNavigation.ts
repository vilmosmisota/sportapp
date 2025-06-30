import { Tenant } from "@/entities/tenant/Tenant.schema";
import {
  BaseNavSection,
  PortalType,
  UsePortalNavigationReturn,
} from "../types/baseDashboard.types";
import { getTopRightNavConfig } from "../utils/topRightNavConfigs";
import { usePortalNavigation } from "./usePortalNavigation";

// Scheduling specific navigation sections
function getSchedulingNavSections(tenant?: Tenant): BaseNavSection[] {
  return [
    {
      section: "",
      items: [
        {
          id: 1,
          name: "Seasons",
          href: "/scheduling/seasons",
          iconName: "Calendar",
          description: "Manage seasons and breaks",
          permissions: [],
          pinnable: true,
        },
        {
          id: 2,
          name: "Calendar",
          href: "/scheduling/calendar",
          iconName: "CalendarDays",
          description: "View and manage calendar events",
          permissions: [],
          pinnable: true,
        },
        {
          id: 3,
          name: "Settings",
          href: "/scheduling/settings",
          iconName: "Settings2",
          description: "Manage scheduling settings",
          permissions: [],
          pinnable: false,
        },
      ],
    },
  ];
}

// Scheduling specific top right navigation config
function getSchedulingTopRightNavConfig(tenant?: Tenant) {
  const domain = "scheduling"; // This would be dynamic in real implementation
  return getTopRightNavConfig(PortalType.SCHEDULING, domain);
}

// Scheduling navigation hook
export function useSchedulingNavigation(
  tenant?: Tenant
): UsePortalNavigationReturn {
  return usePortalNavigation(
    PortalType.SCHEDULING,
    getSchedulingNavSections,
    getSchedulingTopRightNavConfig
  );
}
