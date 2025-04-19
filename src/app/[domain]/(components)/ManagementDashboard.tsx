"use client";

import React, { useState } from "react";
import { PanelLeft } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Sidebar } from "./dashboard/Sidebar";
import { MobileNavigation } from "./dashboard/MobileNavigation";
import { getIcon } from "./dashboard/constants";
import { useTenantConfig } from "./dashboard/hooks/useTenantConfig";
import { useNavigation } from "./dashboard/hooks/useNavigation";
import DashboardTopRightNav from "./dashboard/components/DashboardTopRightNav";
import { DashboardMainFrame } from "./dashboard/components/DashboardMainFrame";

import { cn } from "../../../lib/utils";

import { PinnedNav } from "./dashboard/components/PinnedNav";
import { useUIState } from "../../../browserStorage/localStorage/ui-storage";

/**
 * ManagementDashboard - Main layout component for the organization dashboard
 */
export default function ManagementDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useUIState({
    key: "dashboard.sidebar.collapsed",
    defaultValue: false,
  });
  const [openSections, setOpenSections] = useState<string[]>([]);

  // Routing and tenant data
  const pathname = usePathname();
  const params = useParams();
  const domain = params.domain as string;

  // Custom hooks
  const {
    tenant,
    isTenantLoading,
    teamManagementConfigComplete,
    trainingLocationsConfigured,
    gameLocationsConfigured,
  } = useTenantConfig(domain);

  const { navItems } = useNavigation(
    teamManagementConfigComplete,
    trainingLocationsConfigured,
    gameLocationsConfigured
  );

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
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:text-primary"
          >
            <PanelLeft
              className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed ? "rotate-180" : ""
              )}
            />
          </Button>

          {/* Only show the pinned nav when sidebar is collapsed */}
          {isCollapsed && <PinnedNav navItems={navItems} pathname={pathname} />}
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
        navItems={navItems}
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
        navItems={navItems}
        getIcon={getIcon}
        pathname={pathname}
      />
    </div>
  );
}
