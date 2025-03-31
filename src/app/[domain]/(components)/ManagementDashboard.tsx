"use client";

import React, { useState } from "react";
import { Cog, PanelLeft, UserRound } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Sidebar } from "./dashboard/Sidebar";
import { MobileNavigation } from "./dashboard/MobileNavigation";
import { getIcon } from "./dashboard/constants";
import { useTenantConfig } from "./dashboard/hooks/useTenantConfig";
import { useNavigation } from "./dashboard/hooks/useNavigation";
import DashboardTopRightNav from "./dashboard/components/DashboardTopRightNav";
import { DashboardMainFrame } from "./dashboard/components/DashboardMainFrame";
import { usePinnedItems } from "./dashboard/hooks/usePinnedItems";
import { NavItem } from "./dashboard/constants";
import { cn } from "../../../lib/utils";
import Link from "next/link";

// Component to show pinned items in the top navbar
const PinnedNav = ({
  pinnedItems,
  pathname,
}: {
  pinnedItems: NavItem[];
  pathname: string;
}) => {
  if (pinnedItems.length === 0) return null;

  return (
    <div className="flex h-full items-center justify-start gap-2 relative">
      {pinnedItems.map((item) => {
        const Icon = getIcon(item.iconName);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-md transition-all",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
            )}
          >
            {Icon}
          </Link>
        );
      })}
    </div>
  );
};

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
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const { pinnedItemIds, isRequiredPin } = usePinnedItems();

  // Create a flat list of all nav items
  const allNavItems = navItems.flatMap((section) => section.items);

  // Filter out pinned items
  const pinnedItems = allNavItems.filter((item) =>
    pinnedItemIds.includes(item.id)
  );

  return (
    <div className="flex min-h-screen relative">
      {/* Top-left area for pinned items */}
      <div className="absolute flex flex-col h-12 top-0 left-0 z-50 pt-4">
        <div className="flex h-full items-center justify-start gap-2 px-4  relative">
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

          {/* Always show the pinned nav when sidebar is collapsed */}
          {isCollapsed && (
            <PinnedNav pinnedItems={pinnedItems} pathname={pathname} />
          )}
        </div>
      </div>

      {/* Top-right navigation */}
      <DashboardTopRightNav
        buttons={[
          <Button key="settings" variant="ghost" size="smIcon">
            <Cog className="h-4 w-4" />
          </Button>,
          <Button key="user" variant="ghost" size="smIcon">
            <UserRound className="h-4 w-4" />
          </Button>,
        ]}
      />

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
