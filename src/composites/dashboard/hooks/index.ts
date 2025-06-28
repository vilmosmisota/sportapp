// Portal navigation hooks
export {
  createPortalNavigationHook,
  useCurrentPortalNavigation,
  usePortalNavigation,
} from "./usePortalNavigation";

// Portal-specific navigation hooks
export { useKioskNavigation } from "./useAttendanceNavigation";
export { useManagementNavigation } from "./useManagementNavigation";

// Portal-specific pinned items hook
export { usePortalPinnedItems } from "./usePortalPinnedItems";

// Legacy exports for backward compatibility
export type { NavItem, NavSection } from "./useManagementNavigation";
