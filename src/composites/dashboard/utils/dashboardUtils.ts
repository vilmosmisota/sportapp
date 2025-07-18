import { Access } from "@/entities/role/Role.schema";
import {
  BaseNavItem,
  BaseNavSection,
  PortalConfig,
} from "../types/baseDashboard.types";
import { PORTAL_CONFIGS } from "../types/portalConfigs";

export const hasPortalAccess = (
  userAccess: string[] | undefined,
  portalConfig: PortalConfig
): boolean => {
  if (
    !portalConfig.requiredAccess ||
    portalConfig.requiredAccess.length === 0
  ) {
    return true;
  }

  if (!userAccess) {
    return false;
  }

  if (userAccess.includes(Access.SYSTEM)) {
    return true;
  }

  return portalConfig.requiredAccess.some((access) =>
    userAccess.includes(access)
  );
};

export const getAvailablePortals = (
  userAccess: string[] | undefined
): PortalConfig[] => {
  return Object.values(PORTAL_CONFIGS).filter((config) =>
    hasPortalAccess(userAccess, config)
  );
};

export const filterNavItemsByPermissions = (
  navSections: BaseNavSection[],
  userPermissions: string[] | undefined
): BaseNavSection[] => {
  if (!userPermissions) {
    return navSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) => !item.permissions || item.permissions.length === 0
        ),
      }))
      .filter((section) => section.items.length > 0);
  }

  return navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.permissions || item.permissions.length === 0) {
          return true; // No permissions required
        }
        return item.permissions.some((permission) =>
          userPermissions.includes(permission)
        );
      }),
    }))
    .filter((section) => section.items.length > 0);
};

export const isNavItemActive = (
  item: BaseNavItem,
  pathname: string
): boolean => {
  if (item.href.endsWith("/management") || item.href.endsWith("/attendance")) {
    return pathname === item.href;
  }

  return (
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href + "/"))
  );
};

export const validateNavSections = (navSections: BaseNavSection[]): boolean => {
  return navSections.every(
    (section) =>
      section.section !== undefined &&
      Array.isArray(section.items) &&
      section.items.every(
        (item) =>
          typeof item.id === "number" &&
          typeof item.name === "string" &&
          typeof item.href === "string" &&
          typeof item.iconName === "string" &&
          Array.isArray(item.permissions)
      )
  );
};
