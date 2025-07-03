import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Skeleton } from "../../../components/ui/skeleton";
import { useGlobalPinnedItems } from "../hooks/useGlobalPinnedItems";
import { BaseNavSection, PortalConfig } from "../types/baseDashboard.types";
import { AvailablePortals } from "./AvailablePortals";
import NavItems from "./DashboardNavItems";
import { TenantBranding } from "./TenantBranding";

interface SidebarProps {
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
  currentPortalType?: string | null;
}

/**
 * Sidebar component for the dashboard
 * Uses localStorage for persisting:
 * - Pinned items (via useGlobalPinnedItems hook - global across all portals)
 * - Open sections (via parent component with useUIState)
 */
export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  openSections,
  setOpenSections,
  navSections,
  pathname,
  domain,
  tenant,
  tenantId,
  isTenantLoading,
  portalConfig,
  currentPortalType,
}) => {
  const { isPinned, togglePinItem } = useGlobalPinnedItems();

  const filteredNavItems = navSections.filter(
    (section) => section.section !== "Default"
  );

  // Create a function to handle pin toggling with portal context
  const handleTogglePin = (itemId: number) => {
    const allItems = navSections.flatMap((section) => section.items);
    const item = allItems.find((item) => item.id === itemId);
    if (item) {
      togglePinItem(item, portalConfig.type);
    }
  };

  return (
    <div
      className={cn(
        "group hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 z-20 mt bg-sidebar text-sidebar-foreground",
        isCollapsed
          ? "lg:w-0 lg:opacity-0 lg:translate-x-[-100%] lg:overflow-hidden pointer-events-none"
          : "lg:w-64 lg:opacity-100 lg:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full relative pt-2">
        {/* Tenant name at the top */}
        <div className="px-4 pb-4 ">
          <div className="flex items-center justify-center pt-1">
            <div className="flex items-center justify-center">
              {tenant?.name ? (
                <Link href="/">
                  <p className="text-sm font-semibold text-foreground capitalize min-h-6 flex items-center max-w-[200px] text-center hover:text-primary transition-colors">
                    {tenant.name}
                  </p>
                </Link>
              ) : (
                <Skeleton className="h-6 w-[120px] rounded" />
              )}
            </div>
          </div>
        </div>

        <AvailablePortals
          domain={domain}
          currentPortalType={currentPortalType}
          pathname={pathname}
        />

        {/* Nav items */}
        <ScrollArea className="flex-1 py-2 mt-2">
          <div className={cn("space-y-6", isCollapsed ? "px-2" : "px-4")}>
            {filteredNavItems.map((item) => (
              <div key={item.section}>
                {item.section ? (
                  isCollapsed ? (
                    <NavItems
                      items={item.items}
                      isCollapsed={isCollapsed}
                      pathname={pathname}
                      pinnedItemIds={item.items
                        .filter((navItem) =>
                          isPinned(navItem.id, portalConfig.type)
                        )
                        .map((navItem) => navItem.id)}
                      onTogglePin={handleTogglePin}
                      requiredPinnedItems={[]} // No required pinned items in global system
                      portalColor={portalConfig.color}
                    />
                  ) : (
                    <Accordion
                      type="multiple"
                      value={openSections}
                      onValueChange={setOpenSections}
                      className="space-y-1"
                    >
                      <AccordionItem
                        value={item.section}
                        className="border-none"
                      >
                        <AccordionTrigger className="py-1.5 text-xs font-medium text-sidebar-foreground/70 hover:no-underline">
                          {item.section}
                        </AccordionTrigger>
                        <AccordionContent className="pb-1 pt-0">
                          <NavItems
                            items={item.items}
                            isCollapsed={isCollapsed}
                            pathname={pathname}
                            pinnedItemIds={item.items
                              .filter((navItem) =>
                                isPinned(navItem.id, portalConfig.type)
                              )
                              .map((navItem) => navItem.id)}
                            onTogglePin={handleTogglePin}
                            requiredPinnedItems={[]} // No required pinned items in global system
                            portalColor={portalConfig.color}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )
                ) : (
                  <NavItems
                    items={item.items}
                    isCollapsed={isCollapsed}
                    pathname={pathname}
                    pinnedItemIds={item.items
                      .filter((navItem) =>
                        isPinned(navItem.id, portalConfig.type)
                      )
                      .map((navItem) => navItem.id)}
                    onTogglePin={handleTogglePin}
                    requiredPinnedItems={[]} // No required pinned items in global system
                    portalColor={portalConfig.color}
                  />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Tenant branding at the bottom */}
        <div className="mt-auto">
          <TenantBranding tenant={tenant} isLoading={isTenantLoading} />
        </div>
      </div>
    </div>
  );
};
