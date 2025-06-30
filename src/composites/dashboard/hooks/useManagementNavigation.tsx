import {
  getTenantPerformerName,
  getTenantPerformerSlug,
} from "@/entities/member/Member.utils";
import { Permission } from "@/entities/role/Role.permissions";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import {
  BaseNavSection,
  PortalType,
  UsePortalNavigationReturn,
} from "../types/baseDashboard.types";
import { getTopRightNavConfig } from "../utils/topRightNavConfigs";
import { usePortalNavigation } from "./usePortalNavigation";

// Management specific navigation sections
function getManagementNavSections(tenant?: Tenant): BaseNavSection[] {
  const navSections: BaseNavSection[] = [
    {
      section: "",
      items: [
        {
          id: 4,
          name: tenant ? getTenantPerformerName(tenant) : "Performers",
          href: tenant
            ? `/management/members/${getTenantPerformerSlug(tenant)}`
            : "/management/performers",
          iconName: "Users",
          description: tenant
            ? `Manage your organization's ${getTenantPerformerName(
                tenant
              ).toLowerCase()} and their teams`
            : "Manage your organization's performers and their groups",
          permissions: [Permission.VIEW_MEMBERS, Permission.MANAGE_MEMBERS],
          pinnable: true,
        },
        {
          id: 13,
          name: "Groups",
          href: "/management/groups",
          iconName: "Users2",
          description: "Organize and manage team groups",
          permissions: [Permission.VIEW_GROUP, Permission.MANAGE_GROUP],
          pinnable: true,
        },
        {
          id: 14,
          name: "Settings",
          href: "/management/settings",
          iconName: "Settings2",
          description: "Manage organization settings",
          permissions: [Permission.VIEW_EVENTS, Permission.MANAGE_EVENTS],
          pinnable: true,
        },
      ],
    },
  ];

  return navSections;
}

// Management specific top right navigation config
function getManagementTopRightNavConfig(tenant?: Tenant) {
  const domain = "management"; // This would be dynamic in real implementation
  return getTopRightNavConfig(PortalType.MANAGEMENT, domain);
}

// Management navigation hook using the new portal system
export function useManagementNavigation(
  tenant?: Tenant
): UsePortalNavigationReturn {
  return usePortalNavigation(
    PortalType.MANAGEMENT,
    getManagementNavSections,
    getManagementTopRightNavConfig
  );
}
