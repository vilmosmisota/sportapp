import {
  Bell,
  Building2,
  CircleUser,
  HelpCircle,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PortalType, TopRightNavConfig } from "../types/baseDashboard.types";

// Generate top right nav config for Management portal
export function getManagementTopRightNavConfig(
  domain: string
): TopRightNavConfig {
  return {
    settingsLinks: [
      {
        href: `/${domain}/management/settings/organization`,
        label: "Organization",
        icon: Building2,
      },
      {
        href: `/${domain}/management/settings/users`,
        label: "Users",
        icon: Users,
      },
      {
        href: `/${domain}/management/settings/roles`,
        label: "Roles & Permissions",
        icon: ShieldCheck,
      },
    ],
    userProfileLinks: [
      {
        href: `/${domain}/profile`,
        label: "My Profile",
        icon: CircleUser,
      },
      {
        href: `/${domain}/notifications`,
        label: "Notifications",
        icon: Bell,
      },
      {
        href: `/${domain}/settings`,
        label: "Account Settings",
        icon: Settings,
      },
      {
        href: `/${domain}/help`,
        label: "Help & Support",
        icon: HelpCircle,
      },
    ],
    showNotifications: true,
  };
}

// Generate top right nav config for Kiosk portal
export function getKioskTopRightNavConfig(domain: string): TopRightNavConfig {
  return {
    settingsLinks: [
      {
        href: `/${domain}/kiosk/settings`,
        label: "Kiosk Settings",
        icon: Settings,
      },
    ],
    userProfileLinks: [
      {
        href: `/${domain}/help`,
        label: "Help & Support",
        icon: HelpCircle,
      },
    ],
    showNotifications: false, // Kiosk typically doesn't need notifications
  };
}

// Factory function to get config based on portal type
export function getTopRightNavConfig(
  portalType: PortalType,
  domain: string
): TopRightNavConfig {
  switch (portalType) {
    case PortalType.MANAGEMENT:
      return getManagementTopRightNavConfig(domain);
    case PortalType.KIOSK:
      return getKioskTopRightNavConfig(domain);
    default:
      return getManagementTopRightNavConfig(domain); // Default fallback
  }
}

// Helper to merge custom config with default config
export function mergeTopRightNavConfig(
  defaultConfig: TopRightNavConfig,
  customConfig?: Partial<TopRightNavConfig>
): TopRightNavConfig {
  if (!customConfig) return defaultConfig;

  return {
    settingsLinks: customConfig.settingsLinks ?? defaultConfig.settingsLinks,
    userProfileLinks:
      customConfig.userProfileLinks ?? defaultConfig.userProfileLinks,
    showNotifications:
      customConfig.showNotifications ?? defaultConfig.showNotifications,
    customActions: customConfig.customActions ?? defaultConfig.customActions,
  };
}
