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
import { NavSection } from "../hooks/useManagementNavigation";
import { usePinnedItems } from "../hooks/usePinnedItems";
import { DashboardAuthMenu } from "./DashboardAuthMenu";
import DashboardMobileNavItems from "./DashboardMobileNavItems";

interface MobileNavigationProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  navSections: NavSection[];
  getIcon: (iconName: string) => React.ReactNode;
  pathname: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  setIsOpen,
  navSections,
  getIcon,
  pathname,
}) => {
  const { pinnedItemIds, togglePinItem } = usePinnedItems();

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
                        href="/app/management/settings"
                        className={cn(
                          "flex items-center justify-center h-9 w-9 rounded-md transition-all",
                          pathname === "/app/management/settings" ||
                            pathname.startsWith("/app/management/settings/")
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <Cog className="h-4 w-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end">
                      Organization Setup
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="border-l h-8 pl-2 ml-2 flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 hover:bg-accent/50"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <DashboardMobileNavItems
              navSections={navSections}
              getIcon={getIcon}
              setIsOpen={setIsOpen}
              pinnedItemIds={pinnedItemIds}
              onTogglePin={togglePinItem}
            />

            {/* Mobile Auth Menu */}
            <div className="h-14 border-t ">
              <div className="px-4 h-full flex items-center">
                <DashboardAuthMenu />
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
