import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Cog, X } from "lucide-react";
import Link from "next/link";
import React from "react";
import { usePortalPinnedItems } from "../hooks/usePortalPinnedItems";
import { BaseNavSection, PortalConfig } from "../types/baseDashboard.types";
import { DashboardAuthMenu } from "./DashboardAuthMenu";
import DashboardMobileNavItems from "./DashboardMobileNavItems";

interface MobileNavigationProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  navSections: BaseNavSection[];
  getIcon: (iconName: string) => React.ReactNode;
  pathname: string;
  portalConfig: PortalConfig;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  setIsOpen,
  navSections,
  getIcon,
  pathname,
  portalConfig,
}) => {
  const { pinnedItemIds, togglePinItem } = usePortalPinnedItems(
    portalConfig.type
  );

  // Generate settings link based on portal type
  const getSettingsLink = () => {
    switch (portalConfig.type) {
      case "management":
        return "/management/settings";
      case "attendance":
        return "/attendance/settings";
      default:
        return "/settings";
    }
  };

  const settingsLink = getSettingsLink();

  return (
    <div className="fixed top-0 right-0 z-40 lg:hidden">
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="h-[100dvh]">
          <div className="flex h-full flex-col">
            {/* Mobile Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b bg-muted/40">
              <div className="flex-1"></div>
              <div className="flex items-center gap-2">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={settingsLink}
                        className={cn(
                          "flex items-center justify-center h-9 w-9 rounded-md transition-all",
                          pathname === settingsLink ||
                            pathname.startsWith(settingsLink + "/")
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <Cog className="h-4 w-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end">
                      {portalConfig.title} Settings
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DashboardAuthMenu collapsed={false} />

                <Button
                  variant="ghost"
                  size="smIcon"
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Nav Items */}
            <DashboardMobileNavItems
              navSections={navSections.map((section) => ({
                ...section,
                items: section.items.map((item) => ({
                  ...item,
                  pinnable: item.pinnable ?? false,
                })),
              }))}
              getIcon={getIcon}
              setIsOpen={setIsOpen}
              pinnedItemIds={pinnedItemIds}
              onTogglePin={togglePinItem}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
