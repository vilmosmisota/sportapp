import { Tenant } from "@/entities/tenant/Tenant.schema";
import {
  BaseNavSection,
  PortalType,
  UsePortalNavigationReturn,
} from "../types/baseDashboard.types";
import { getTopRightNavConfig } from "../utils/topRightNavConfigs";
import { usePortalNavigation } from "./usePortalNavigation";

// Members specific navigation sections
function getUsersNavSections(tenant?: Tenant): BaseNavSection[] {
  return [
    {
      section: "",
      items: [
        {
          id: 1,
          name: "Roles",
          href: "/members/roles",
          iconName: "Users",
          description: "Manage roles",
          permissions: [],
          pinnable: true,
        },
        {
          id: 2,
          name: "Staff",
          href: "/members/staff",
          iconName: "Users",
          description: "Manage staff",
          permissions: [],
          pinnable: true,
        },
        {
          id: 3,
          name: "Guardians",
          href: "/members/guardians",
          iconName: "Shield",
          description: "Manage guardians",
          permissions: [],
          pinnable: true,
        },
        {
          id: 4,
          name: "Performer Users",
          href: "/members/performer-users",
          iconName: "Users",
          description: "Manage performer users",
          permissions: [],
          pinnable: true,
        },
      ],
    },
  ];
}

// Members specific top right navigation config
function getUsersTopRightNavConfig(tenant?: Tenant) {
  const domain = "members"; // This would be dynamic in real implementation
  return getTopRightNavConfig(PortalType.USERS, domain);
}

// Members navigation hook
export function useUsersNavigation(tenant?: Tenant): UsePortalNavigationReturn {
  return usePortalNavigation(
    PortalType.USERS,
    getUsersNavSections,
    getUsersTopRightNavConfig
  );
}
