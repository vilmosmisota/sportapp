"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/libs/tailwind/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  UserRound,
  Dumbbell,
  BarChart3,
  GraduationCap,
  LayoutDashboard,
  Globe,
  Hammer,
  ShieldCheck,
  ClipboardCheck,
  Users2,
  X,
  Swords,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Menu as MenuIcon } from "lucide-react";
import { DashboardAuthMenu } from "./DashboardAuthMenu";
import { DashboardBranding } from "./DashboardBranding";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DomainSwitcher } from "./DomainSwitcher";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";

const iconMap = {
  Globe,
  LayoutDashboard,
  Hammer,
  Building2,
  GraduationCap,
  Users2,
  UserRound,
  ShieldCheck,
  Dumbbell,
  ClipboardCheck,
  BarChart3,
  Swords,
};

interface NavItem {
  name: string;
  href: string;
  iconName: string;
  description?: string;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

interface DashboardProps {
  items: NavSection[];
  children: React.ReactNode;
}

export default function Dashboard({ items, children }: DashboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  const pathname = usePathname();
  const params = useParams();
  const domain = params.domain as string;

  const { data: tenant, isLoading: isTenantLoading } =
    useTenantByDomain(domain);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setOpenTooltip(null); // Close any open tooltips when collapsing
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={cn(
          "group hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 z-20",
          isCollapsed ? "lg:w-16" : "lg:w-72"
        )}
      >
        <div className="flex flex-col h-full bg-background border-r relative">
          {/* Header area with branding and navigation */}
          <div className="h-14 flex items-center border-b bg-muted/40">
            <div
              className={cn(
                "flex items-center justify-between w-full transition-all duration-300 h-full",
                isCollapsed ? "px-2" : "pl-4"
              )}
            >
              {isCollapsed ? (
                <DomainSwitcher
                  currentDomain={domain}
                  tenantId={tenant?.id}
                  collapsed
                />
              ) : (
                <>
                  <DashboardBranding
                    domain={domain}
                    tenant={tenant}
                    isLoading={isTenantLoading}
                  />
                  <div className="border-l h-full flex items-center">
                    <DomainSwitcher
                      currentDomain={domain}
                      tenantId={tenant?.id}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Collapse Rail */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute inset-y-0 right-0 w-1.5 bg-transparent group-hover:bg-accent/30 cursor-col-resize transition-colors"
                  onClick={handleCollapse}
                >
                  <div className="absolute inset-y-0 -left-0.5 w-0.5 bg-accent/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-y-0 -right-0.5 w-0.5 bg-accent/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <span className="text-sm">
                  {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Nav items */}
          <ScrollArea className="flex-1 py-2">
            <div className={cn("space-y-6", isCollapsed ? "px-2" : "px-4")}>
              {items.map((section) => (
                <div key={section.section} className="space-y-1">
                  <h4
                    className={cn(
                      "text-xs font-medium text-muted-foreground/70 uppercase tracking-wider px-2 mb-2 transition-all duration-300",
                      isCollapsed && "opacity-0 h-0 mb-0 overflow-hidden"
                    )}
                  >
                    {section.section}
                  </h4>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <TooltipProvider key={item.href} delayDuration={0}>
                        <Tooltip
                          open={isCollapsed && openTooltip === item.href}
                          onOpenChange={(open) => {
                            if (open) {
                              setOpenTooltip(item.href);
                            } else {
                              setOpenTooltip(null);
                            }
                          }}
                        >
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              className={cn(
                                "group/item flex rounded-md transition-all duration-200 relative",
                                isCollapsed
                                  ? "w-10 h-10 justify-center items-center"
                                  : "px-3 py-1.5 items-center",
                                pathname === item.href
                                  ? "bg-accent text-accent-foreground"
                                  : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
                              )}
                            >
                              <div
                                className={cn(
                                  isCollapsed
                                    ? "flex items-center justify-center"
                                    : "flex items-center gap-x-3 w-full"
                                )}
                              >
                                {getIcon(item.iconName)}
                                {!isCollapsed && (
                                  <span className="text-sm font-medium truncate">
                                    {item.name}
                                  </span>
                                )}
                              </div>
                              {pathname === item.href && !isCollapsed && (
                                <div className="ml-auto h-1 w-1 rounded-full bg-primary" />
                              )}
                            </Link>
                          </TooltipTrigger>
                          {isCollapsed && (
                            <TooltipContent side="right" sideOffset={10}>
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">{item.name}</span>
                                {item.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.description}
                                  </span>
                                )}
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Auth Menu - Sticky Bottom */}
          <div className="h-14 border-t bg-muted/40">
            <div
              className={cn(
                "h-full flex items-center",
                isCollapsed ? "justify-center" : "px-4"
              )}
            >
              <DashboardAuthMenu collapsed={isCollapsed} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          isCollapsed ? "lg:pl-16" : "lg:pl-72"
        )}
      >
        <main className="py-6">
          <div className="px-6">{children}</div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="fixed top-4 right-4 z-40 lg:hidden">
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button className="h-9 w-9" variant="outline" size="icon">
              <MenuIcon className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[100dvh]">
            <div className="flex h-full flex-col">
              {/* Mobile Header */}
              <div className="h-14 flex items-center justify-between px-4 border-b bg-muted/40">
                <DashboardBranding
                  domain={domain}
                  tenant={tenant}
                  isLoading={isTenantLoading}
                />
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

              {/* Mobile Nav Items */}
              <ScrollArea className="flex-1">
                <div className="space-y-6 p-4">
                  {items.map((section) => (
                    <div key={section.section} className="space-y-1">
                      <h4 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider px-2 mb-2">
                        {section.section}
                      </h4>
                      <div className="space-y-1">
                        {section.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "group flex items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
                              pathname === item.href
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
                            )}
                          >
                            <div className="flex items-center gap-x-3">
                              {getIcon(item.iconName)}
                              <span>{item.name}</span>
                            </div>
                            {pathname === item.href && (
                              <div className="h-1 w-1 rounded-full bg-primary" />
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Mobile Auth Menu */}
              <div className="h-14 border-t bg-muted/40">
                <div className="px-4 h-full flex items-center">
                  <DashboardAuthMenu />
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
