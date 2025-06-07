import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import React from "react";
import { NavSection } from "../hooks/useManagementNavigation";
import { usePinnedItems } from "../hooks/usePinnedItems";
import { AccessPortalsDropdown } from "./AccessPortalsDropdown";
import NavItems from "./DashboardNavItems";
import { TenantBranding } from "./TenantBranding";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  openSections: string[];
  setOpenSections: (sections: string[]) => void;
  navSections: NavSection[];
  pathname: string;
  getIcon: (iconName: string) => React.ReactNode;
  domain: string;
  tenant: any;
  tenantId?: number;
  isTenantLoading: boolean;
}

/**
 * Sidebar component for the dashboard
 * Uses localStorage for persisting:
 * - Pinned items (via usePinnedItems hook)
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
}) => {
  const { pinnedItemIds, togglePinItem } = usePinnedItems();

  const filteredNavItems = navSections.filter(
    (section) => section.section !== "Default"
  );
  const allNavItems = filteredNavItems.flatMap((section) => section.items);

  const defaultItems =
    navSections.find((navSection) => navSection.section === "Default")?.items ||
    [];

  const pinnedItems = [...defaultItems, ...allNavItems].filter((item) =>
    pinnedItemIds.includes(item.id)
  );

  return (
    <div
      className={cn(
        "group hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 z-20 mt bg-sidebar text-sidebar-foreground",
        isCollapsed
          ? "lg:w-0 lg:opacity-0 lg:translate-x-[-100%] lg:overflow-hidden pointer-events-none"
          : "lg:w-72 lg:opacity-100 lg:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full relative pt-4">
        {/* Access portals dropdown at the top */}
        <div className="px-4 pb-4 border-b border-border/50">
          <AccessPortalsDropdown />
        </div>

        {/* Pinned nav items - stored in localStorage */}
        {pinnedItems.length > 0 && (
          <div className={cn("pt-4 pb-2", isCollapsed ? "px-2" : "px-4")}>
            <div className="space-y-1">
              {!isCollapsed && (
                <div className="text-xs font-medium text-muted-foreground/70 py-1">
                  Pinned
                </div>
              )}
              <NavItems
                items={pinnedItems}
                isCollapsed={isCollapsed}
                pathname={pathname}
                pinnedItemIds={pinnedItemIds}
                onTogglePin={togglePinItem}
                requiredPinnedItems={[1, 2]} // Home and Schedule are required
              />
            </div>
            {!isCollapsed && pinnedItems.length > 0 && (
              <div className="h-px bg-border/50 my-4" />
            )}
          </div>
        )}

        {/* Nav items */}
        <ScrollArea className="flex-1 py-2">
          <div className={cn("space-y-6", isCollapsed ? "px-2" : "px-4")}>
            {filteredNavItems.map((item) => (
              <div key={item.section}>
                {item.section ? (
                  isCollapsed ? (
                    <NavItems
                      items={item.items}
                      isCollapsed={isCollapsed}
                      pathname={pathname}
                      pinnedItemIds={pinnedItemIds}
                      onTogglePin={togglePinItem}
                      requiredPinnedItems={[1, 2]} // Home and Schedule are required
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
                        <AccordionTrigger className="py-1.5 text-xs font-medium text-muted-foreground/70 hover:no-underline">
                          {item.section}
                        </AccordionTrigger>
                        <AccordionContent className="pb-1 pt-0">
                          <NavItems
                            items={item.items}
                            isCollapsed={isCollapsed}
                            pathname={pathname}
                            pinnedItemIds={pinnedItemIds}
                            onTogglePin={togglePinItem}
                            requiredPinnedItems={[1, 2]} // Home and Schedule are required
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
                    pinnedItemIds={pinnedItemIds}
                    onTogglePin={togglePinItem}
                    requiredPinnedItems={[1, 2]} // Home and Schedule are required
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
