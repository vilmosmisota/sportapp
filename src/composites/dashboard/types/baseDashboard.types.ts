import { Permission } from "@/entities/role/Role.permissions";
import { LucideIcon } from "lucide-react";

// Base navigation item interface
export interface BaseNavItem {
  id: number;
  name: string;
  href: string;
  iconName: string;
  description: string;
  permissions: Permission[];
  pinnable: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

// Base navigation section interface
export interface BaseNavSection {
  section: string;
  items: BaseNavItem[];
}

// Portal types enum
export enum PortalType {
  MANAGEMENT = "management",
  ATTENDANCE = "attendance",
}

// Portal configuration interface
export interface PortalConfig {
  type: PortalType;
  title: string;
  description: string;
  icon: LucideIcon;
  requiredAccess?: string[]; // Access levels required for this portal
}

// Top right navigation configuration
export interface TopRightNavConfig {
  settingsLinks?: {
    href: string;
    label: string;
    icon: LucideIcon;
  }[];
  userProfileLinks?: {
    href: string;
    label: string;
    icon: LucideIcon;
  }[];
  showNotifications?: boolean;
  customActions?: React.ReactNode;
}

// Base dashboard props interface
export interface BaseDashboardProps {
  children: React.ReactNode;
  portalConfig: PortalConfig;
  navSections: BaseNavSection[];
  topRightNavConfig?: TopRightNavConfig;
  customSidebarContent?: React.ReactNode;
  customTopLeftContent?: React.ReactNode;
}

// Navigation hook interface that all portal navigation hooks should implement
export interface UsePortalNavigationReturn {
  navSections: BaseNavSection[];
  portalConfig: PortalConfig;
  topRightNavConfig?: TopRightNavConfig;
}

// Portal navigation hook factory type
export type PortalNavigationHook = (tenant?: any) => UsePortalNavigationReturn;

// Pinned items configuration
export interface PinnedItemsConfig {
  storageKey: string;
  defaultPinnedItems: number[];
  requiredPinnedItems: number[];
}

// Mobile navigation props
export interface MobileNavigationProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  navSections: BaseNavSection[];
  getIcon: (iconName: string) => React.ReactNode;
  pathname: string;
  portalConfig: PortalConfig;
}

// Sidebar props interface
export interface BaseSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  openSections: string[];
  setOpenSections: (sections: string[]) => void;
  navSections: BaseNavSection[];
  pathname: string;
  getIcon: (iconName: string) => React.ReactNode;
  domain: string;
  tenant: any;
  tenantId?: number;
  isTenantLoading: boolean;
  portalConfig: PortalConfig;
  pinnedItemsConfig?: PinnedItemsConfig;
}

// Dashboard context interface for sharing state between components
export interface DashboardContextValue {
  portalConfig: PortalConfig;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobile: boolean;
  pathname: string;
  domain: string;
  tenant: any;
}
