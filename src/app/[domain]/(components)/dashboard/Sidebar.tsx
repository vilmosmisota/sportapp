import React from "react";
import { cn } from "../../../../lib/utils";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../../components/ui/accordion";
import { NavSection, NavItem } from "./constants";
import { DomainNavigation } from "./components/DomainNavigation";
import { TenantBranding } from "./components/TenantBranding";
import NavItems from "./components/DashboardNavItems";
import { usePinnedItems } from "./hooks/usePinnedItems";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  openSections: string[];
  setOpenSections: (sections: string[]) => void;
  navItems: NavSection[];
  pathname: string;
  getIcon: (iconName: string) => React.ReactNode;
  domain: string;
  tenant: any;
  tenantId?: number;
  isTenantLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  openSections,
  setOpenSections,
  navItems,
  pathname,
  getIcon,
  domain,
  tenant,
  tenantId,
  isTenantLoading,
}) => {
  const { pinnedItemIds, togglePinItem, isPinned, isRequiredPin } =
    usePinnedItems();

  // Create a flat list of all nav items, excluding the Default section
  const filteredNavItems = navItems.filter(
    (section) => section.section !== "Default"
  );
  const allNavItems = filteredNavItems.flatMap((section) => section.items);

  // Get the Default section items separately for pinned items
  const defaultItems =
    navItems.find((section) => section.section === "Default")?.items || [];

  // Filter out pinned items
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
        {/* Domain navigation at the top */}
        <div className="px-4 pl-12 mb-4">
          <DomainNavigation
            currentDomain={domain}
            isLoading={isTenantLoading}
            tenantId={tenantId}
          />
        </div>

        {/* Pinned nav items */}
        {pinnedItems.length > 0 && (
          <div className={cn("py-2", isCollapsed ? "px-2" : "px-4")}>
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
