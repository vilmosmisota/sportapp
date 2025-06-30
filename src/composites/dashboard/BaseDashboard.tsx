"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, PanelLeft } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { useUIState } from "@/browserStorage/localStorage/ui-storage";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { useMediaQuery } from "@/utils/hooks";

import { CollapsedPortalDropdown } from "./components/CollapsedPortalDropdown";
import { DashboardMainFrame } from "./components/DashboardMainFrame";
import DynamicTopRightNav from "./components/DynamicTopRightNav";
import { GlobalPinnedNav } from "./components/GlobalPinnedNav";
import { MobileNavigation } from "./components/MobileNavigation";
import { Sidebar } from "./components/Sidebar";
import { DashboardContextProvider } from "./context/DashboardContext";
import { useAttendanceNavigation } from "./hooks/useAttendanceNavigation";
import { useManagementNavigation } from "./hooks/useManagementNavigation";
import { useMembersNavigation } from "./hooks/useMembersNavigation";
import { useSchedulingNavigation } from "./hooks/useSchedulingNavigation";
import {
  getIcon,
  getPortalConfig,
  getTopRightNavConfig,
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
    if (routeWithoutDomain.startsWith("/scheduling"))
      return PortalType.SCHEDULING;
    if (routeWithoutDomain.startsWith("/attendance"))
      return PortalType.ATTENDANCE;
    if (routeWithoutDomain.startsWith("/members")) return PortalType.MEMBERS;
    return null; // Home page - no specific portal
  }, [pathname, domain]);

  // Get portal config if we're in a portal
  const portalConfig = useMemo(() => {
    return currentPortalType ? getPortalConfig(currentPortalType) : null;
  }, [currentPortalType]);

  // Get navigation sections based on current portal
  const managementNav = useManagementNavigation(tenant);
  const schedulingNav = useSchedulingNavigation(tenant);
  const attendanceNav = useAttendanceNavigation(tenant);
  const membersNav = useMembersNavigation(tenant);

  const navSections: BaseNavSection[] = useMemo(() => {
    if (currentPortalType === PortalType.MANAGEMENT) {
      return managementNav.navSections;
    }
    if (currentPortalType === PortalType.SCHEDULING) {
      return schedulingNav.navSections;
    }
    if (currentPortalType === PortalType.ATTENDANCE) {
      return attendanceNav.navSections;
    }
    if (currentPortalType === PortalType.MEMBERS) {
      return membersNav.navSections;
    }
    // For home page, return empty nav sections (only show portal switcher)
    return [];
  }, [
    currentPortalType,
    managementNav.navSections,
    schedulingNav.navSections,
    attendanceNav.navSections,
    membersNav.navSections,
  ]);

  // Global UI state - no longer portal-specific
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useUIState({
    key: "dashboard.global.sidebar.collapsed",
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

            {/* Fixed portal dropdown when it is collapsed */}
            <CollapsedPortalDropdown
              isCollapsed={isCollapsed}
              domain={domain}
              currentPortalType={currentPortalType}
              pathname={pathname}
            />

            <GlobalPinnedNav
              isCollapsed={isCollapsed}
              managementNavSections={managementNav.navSections}
              schedulingNavSections={schedulingNav.navSections}
              attendanceNavSections={attendanceNav.navSections}
              membersNavSections={membersNav.navSections}
              pathname={pathname}
              domain={domain}
            />
          </div>

          {/* Global Pinned Items Navigation */}
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
