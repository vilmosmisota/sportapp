"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, PanelLeft } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { useUIState } from "@/browserStorage/localStorage/ui-storage";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { useMediaQuery } from "@/utils/hooks";

import { DashboardMainFrame } from "./components/DashboardMainFrame";
import DynamicTopRightNav from "./components/DynamicTopRightNav";
import { MobileNavigation } from "./components/MobileNavigation";
import { Sidebar } from "./components/Sidebar";
import { DashboardContextProvider } from "./context/DashboardContext";
import { useKioskNavigation } from "./hooks/useKioskNavigation";
import { useManagementNavigation } from "./hooks/useManagementNavigation";
import {
  getIcon,
  getPortalConfig,
  getTopRightNavConfig,
  PORTAL_STORAGE_KEYS,
  PortalType,
} from "./types";
import {
  BaseNavSection,
  DashboardContextValue,
} from "./types/baseDashboard.types";

interface BaseDashboardProps {
  children: React.ReactNode;
}

export default function BaseDashboard({ children }: BaseDashboardProps) {
  const { tenant, isLoading: isTenantLoading } =
    useTenantAndUserAccessContext();

  const pathname = usePathname();
  const params = useParams();
  const domain = params.domain as string;

  // Detect current portal type from pathname
  const currentPortalType = useMemo(() => {
    // Remove domain from pathname to get the actual route
    const routeWithoutDomain = pathname.replace(`/${domain}`, "") || "/";

    if (routeWithoutDomain.startsWith("/management"))
      return PortalType.MANAGEMENT;
    if (routeWithoutDomain.startsWith("/kiosk")) return PortalType.KIOSK;
    return null; // Home page - no specific portal
  }, [pathname, domain]);

  // Get portal config if we're in a portal
  const portalConfig = useMemo(() => {
    return currentPortalType ? getPortalConfig(currentPortalType) : null;
  }, [currentPortalType]);

  // Get storage keys based on current portal (default to management if on home)
  const storageKeys = useMemo(() => {
    return PORTAL_STORAGE_KEYS[currentPortalType || PortalType.MANAGEMENT];
  }, [currentPortalType]);

  // Get navigation sections based on current portal
  const managementNav = useManagementNavigation(tenant);
  const kioskNav = useKioskNavigation(tenant);

  const navSections: BaseNavSection[] = useMemo(() => {
    if (currentPortalType === PortalType.MANAGEMENT) {
      return managementNav.navSections;
    }
    if (currentPortalType === PortalType.KIOSK) {
      return kioskNav.navSections;
    }
    // For home page, return empty nav sections (only show portal switcher)
    return [];
  }, [currentPortalType, managementNav.navSections, kioskNav.navSections]);

  // UI state with portal-specific storage keys
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useUIState({
    key: storageKeys.sidebarCollapsed,
    defaultValue: false,
  });
  const [openSections, setOpenSections] = useState<string[]>([]);

  const isMobile = useMediaQuery("(max-width: 1023px)");

  const topRightNavConfig = useMemo(() => {
    if (currentPortalType) {
      return getTopRightNavConfig(currentPortalType, domain);
    }
    return getTopRightNavConfig(PortalType.MANAGEMENT, domain);
  }, [currentPortalType, domain]);

  const dashboardContextValue: DashboardContextValue = useMemo(
    () => ({
      portalConfig: portalConfig || getPortalConfig(PortalType.MANAGEMENT),
      isCollapsed,
      setIsCollapsed,
      isMobile,
      pathname,
      domain,
      tenant,
    }),
    [
      portalConfig,
      isCollapsed,
      setIsCollapsed,
      isMobile,
      pathname,
      domain,
      tenant,
    ]
  );

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsOpen(true);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <DashboardContextProvider value={dashboardContextValue}>
      <div className="flex min-h-screen relative">
        {/* Top-left area for sidebar toggle */}
        <div className="absolute flex flex-col h-8 top-2 left-0 z-50">
          <div
            className={cn(
              "flex h-full items-center justify-end gap-2 px-4 relative rounded-md transition-all duration-300"
            )}
          >
            {/* Sidebar toggle button */}
            <Button
              variant="ghost"
              size="smIcon"
              onClick={handleToggleSidebar}
              className="text-sidebar-foreground hover:text-primary"
              aria-label="Toggle navigation"
            >
              {isMobile ? (
                <Menu className="h-4 w-4" />
              ) : (
                <PanelLeft
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isCollapsed ? "rotate-180" : ""
                  )}
                />
              )}
            </Button>
          </div>
        </div>

        {/* Top-right navigation */}
        <DynamicTopRightNav
          isCollapsed={isCollapsed}
          portalType={currentPortalType || PortalType.MANAGEMENT}
          config={topRightNavConfig}
        />

        {/* Desktop Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          openSections={openSections}
          setOpenSections={setOpenSections}
          navSections={navSections}
          pathname={pathname}
          getIcon={getIcon}
          domain={domain}
          tenant={tenant}
          tenantId={tenant?.id}
          isTenantLoading={isTenantLoading}
          portalConfig={portalConfig || getPortalConfig(PortalType.MANAGEMENT)}
          currentPortalType={currentPortalType}
        />

        {/* Main content */}
        <DashboardMainFrame isCollapsed={isCollapsed}>
          {children}
        </DashboardMainFrame>

        {/* Mobile Navigation */}
        <MobileNavigation
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          navSections={navSections}
          getIcon={getIcon}
          pathname={pathname}
          portalConfig={portalConfig || getPortalConfig(PortalType.MANAGEMENT)}
        />
      </div>
    </DashboardContextProvider>
  );
}
