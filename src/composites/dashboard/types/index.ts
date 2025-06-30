// Base dashboard types
export type {
  BaseDashboardProps,
  BaseNavItem,
  BaseNavSection,
  BaseSidebarProps,
  DashboardContextValue,
  MobileNavigationProps,
  PortalConfig,
  PortalNavigationHook,
  TopRightNavConfig,
  UsePortalNavigationReturn,
} from "./baseDashboard.types";

export { PortalType } from "./baseDashboard.types";

// Portal configurations
export {
  PORTAL_CONFIGS,
  getPortalConfig,
  getPortalTypeFromPath,
} from "./portalConfigs";

// Dashboard utilities
export {
  filterNavItemsByPermissions,
  getAvailablePortals,
  hasPortalAccess,
  isNavItemActive,
  validateNavSections,
} from "../utils/dashboardUtils";

// Top right navigation utilities
export {
  getKioskTopRightNavConfig,
  getManagementTopRightNavConfig,
  getTopRightNavConfig,
  mergeTopRightNavConfig,
} from "../utils/topRightNavConfigs";

// Re-export constants for backward compatibility
export { ICON_MAP, getIcon } from "./constants";
