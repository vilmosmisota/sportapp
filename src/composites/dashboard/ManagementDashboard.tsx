"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, PanelLeft } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import React, { useState } from "react";

import { useUIState } from "@/browserStorage/localStorage/ui-storage";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { useMediaQuery } from "@/utils/hooks";

import { DashboardMainFrame } from "./components/DashboardMainFrame";
import DashboardTopRightNav from "./components/DashboardTopRightNav";
import { MobileNavigation } from "./components/MobileNavigation";
import { PinnedNav } from "./components/PinnedNav";
import { Sidebar } from "./components/Sidebar";
import { useManagementNavigation } from "./hooks/useManagementNavigation";
import { getIcon } from "./types/constants";

export default function ManagementDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, isLoading: isTenantLoading } =
    useTenantAndUserAccessContext();

  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useUIState({
    key: "dashboard.sidebar.collapsed",
    defaultValue: false,
  });
  const [openSections, setOpenSections] = useState<string[]>([]);

  const isMobile = useMediaQuery("(max-width: 1023px)");

  const pathname = usePathname();
  const params = useParams();
  const domain = params.domain as string;

  const { navSections } = useManagementNavigation(tenant || undefined);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsOpen(true);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const shouldShowPinnedNav = isMobile || isCollapsed;

  return (
    <div className="flex min-h-screen relative">
      {/* Top-left area for pinned items */}
      <div className="absolute flex flex-col h-12 top-0 left-0 z-50 pt-4">
        <div
          className={cn(
            "flex h-full items-center justify-start gap-2 px-4 relative rounded-md transition-all duration-300"
          )}
        >
          <Button
            variant="ghost"
            size="smIcon"
            onClick={handleToggleSidebar}
            className="text-muted-foreground hover:text-primary"
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

          {/* Show pinned nav when on mobile or when sidebar is collapsed on desktop */}
          {shouldShowPinnedNav && (
            <PinnedNav navSections={navSections} pathname={pathname} />
          )}
        </div>
      </div>

      {/* Top-right navigation */}
      <DashboardTopRightNav isCollapsed={isCollapsed} />

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
      />
    </div>
  );
}
