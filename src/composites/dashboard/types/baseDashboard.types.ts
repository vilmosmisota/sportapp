import { Permission } from "@/entities/role/Role.permissions";
import { Tenant } from "@/entities/tenant/Tenant.schema";
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
  SCHEDULING = "scheduling",
  ATTENDANCE = "attendance",
  USERS = "users",
}

// Portal configuration interface
export interface PortalConfig {
  type: PortalType;
  title: string;
  description: string;
  icon: LucideIcon;
  requiredAccess?: string[]; // Access levels required for this portal
  color?: string;
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
  tenant: Tenant | undefined;
  tenantId?: number;
  isTenantLoading: boolean;
  portalConfig: PortalConfig;
}

// Dashboard context interface for sharing state between components
export interface DashboardContextValue {
  portalConfig: PortalConfig;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobile: boolean;
  pathname: string;
  domain: string;
  tenant: Tenant | undefined;
}

// Legacy interface for backward compatibility
export interface NavItem {
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

export interface NavSection {
  section: string;
  items: NavItem[];
}
