// Portal navigation hooks
export {
  createPortalNavigationHook,
  useCurrentPortalNavigation,
  usePortalNavigation,
} from "./usePortalNavigation";

// Portal-specific navigation hooks
export { useAttendanceNavigation } from "./useAttendanceNavigation";
export { useManagementNavigation } from "./useManagementNavigation";
export { useSchedulingNavigation } from "./useSchedulingNavigation";
export { useUsersNavigation } from "./useUsersNavigation";

// Global pinned items hook
export { useGlobalPinnedItems } from "./useGlobalPinnedItems";

// Legacy exports for backward compatibility
export type { NavItem, NavSection } from "../types/baseDashboard.types";
