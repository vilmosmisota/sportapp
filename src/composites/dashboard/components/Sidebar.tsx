import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Skeleton } from "../../../components/ui/skeleton";
import { usePortalPinnedItems } from "../hooks/usePortalPinnedItems";
import { BaseNavSection, PortalConfig } from "../types/baseDashboard.types";
import { getAvailablePortals } from "../utils/dashboardUtils";
import NavItems from "./DashboardNavItems";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  openSections: string[];
  setOpenSections: (sections: string[]) => void;
  navSections: BaseNavSection[];
  pathname: string;
  getIcon: (iconName: string) => React.ReactNode;
  domain: string;
  tenant: any;
  tenantId?: number;
  isTenantLoading: boolean;
  portalConfig: PortalConfig;
  currentPortalType?: string | null;
}

/**
 * Sidebar component for the dashboard
 * Uses localStorage for persisting:
 * - Pinned items (via usePortalPinnedItems hook)
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
  const { pinnedItemIds, togglePinItem, config } = usePortalPinnedItems(
    portalConfig.type
  );

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
      <div className="flex flex-col h-full relative pt-2">
        {/* Tenant name at the top */}
        <div className="px-4 pb-4 ">
          <div className="flex items-center justify-center pt-1">
            <div className="flex items-center justify-center">
              {tenant?.name ? (
                <p className="text-sm font-semibold text-foreground capitalize min-h-6 flex items-center max-w-[200px] text-center">
                  {tenant.name}
                </p>
              ) : (
                <Skeleton className="h-6 w-[120px] rounded" />
              )}
            </div>
          </div>
        </div>

        {/* Lets list accessable portals here that are coming from the user roles*/}
        <AvailablePortals
          domain={domain}
          currentPortalType={currentPortalType}
          pathname={pathname}
        />

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
                requiredPinnedItems={config.requiredPinnedItems}
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
                      requiredPinnedItems={config.requiredPinnedItems}
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
                            requiredPinnedItems={config.requiredPinnedItems}
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
                    requiredPinnedItems={config.requiredPinnedItems}
                  />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Tenant branding at the bottom */}
        {/* <div className="mt-auto">
          <TenantBranding tenant={tenant} isLoading={isTenantLoading} />
        </div> */}
      </div>
    </div>
  );
};

interface AvailablePortalsProps {
  domain: string;
  currentPortalType?: string | null;
  pathname: string;
}

function AvailablePortals({
  domain,
  currentPortalType,
  pathname,
}: AvailablePortalsProps) {
  const { tenantUser } = useTenantAndUserAccessContext();

  const availablePortals = React.useMemo(() => {
    if (!tenantUser?.role?.access) return [];

    return getAvailablePortals(tenantUser.role.access);
  }, [tenantUser]);

  if (!availablePortals || availablePortals.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pb-4">
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground/70 py-1">
          Portals
        </div>
        <div className="grid grid-cols-1 gap-2">
          {availablePortals.map((portal) => {
            const Icon = portal.icon;
            const isActive =
              currentPortalType === portal.type && currentPortalType !== null;

            return (
              <Button
                key={portal.type}
                variant="ghost"
                className={cn(
                  "h-auto p-3 justify-start text-left border transition-all duration-200",
                  isActive
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                    : "border-border/50 hover:border-border text-muted-foreground hover:text-foreground"
                )}
                asChild
              >
                <Link href={`/${portal.type}`}>
                  <div className="flex items-start gap-3 w-full">
                    <div
                      className={cn(
                        "p-1.5 rounded-md shrink-0 mt-0.5",
                        isActive ? "bg-primary/10" : "bg-muted/50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm leading-tight">
                        {portal.title}
                      </div>
                      <div className="text-xs opacity-70 mt-0.5 line-clamp-2">
                        {portal.description}
                      </div>
                    </div>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
      <div className="h-px bg-border/50 my-4" />
    </div>
  );
}
