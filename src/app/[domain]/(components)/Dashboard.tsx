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
  Calendar,
  ChevronDown,
  Cog,
  CheckCircle2,
  ChevronRight,
  Trophy,
  CalendarCheck,
  History,
  LineChart,
  Newspaper,
  Home,
  CalendarDays,
  SunSnow,
  Users,
  CalendarCheck2,
  ClipboardList,
  Activity,
  CalendarClock,
  ClipboardPen,
  Signal,
  Archive,
  LibraryBig,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
import { useCurrentUser } from "@/entities/user/User.query";
import { RoleDomain } from "@/entities/role/Role.permissions";
import { useTenantFeatures } from "@/entities/tenant/TenantFeatures.query";
import { Badge } from "@/components/ui/badge";

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
  Calendar,
  Cog,
  Trophy,
  CalendarCheck,
  LineChart,
  History,
  Newspaper,
  Home,
  CalendarDays,
  SunSnow,
  Users,
  CalendarCheck2,
  ClipboardList,
  Activity,
  CalendarClock,
  ClipboardPen,
  Signal,
  Archive,
  LibraryBig,
};

// Domain mapping (copied from DomainSwitcher)
const domainIcons: Record<RoleDomain, any> = {
  [RoleDomain.MANAGEMENT]: Building2,
  [RoleDomain.FAMILY]: Users2,
  [RoleDomain.PLAYER]: UserRound,
  [RoleDomain.SYSTEM]: ShieldCheck,
};

const domainLabels: Record<RoleDomain, string> = {
  [RoleDomain.MANAGEMENT]: "Organization",
  [RoleDomain.FAMILY]: "Family",
  [RoleDomain.PLAYER]: "Player",
  [RoleDomain.SYSTEM]: "System",
};

const domainRoutes: Record<RoleDomain, string> = {
  [RoleDomain.MANAGEMENT]: "/o/dashboard",
  [RoleDomain.FAMILY]: "/f/dashboard",
  [RoleDomain.PLAYER]: "/p/dashboard",
  [RoleDomain.SYSTEM]: "/o/dashboard", // System roles default to organization dashboard
};

interface NavItem {
  name: string;
  href: string;
  iconName: string;
  description?: string;
  disabled?: boolean;
  disabledReason?: string;
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
  const [openSections, setOpenSections] = useState<string[]>([]);

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

  // Find admin navigation items
  const adminNavItems =
    items.find((section) => section.section === "Administration")?.items || [];

  // Find non-admin navigation items
  const mainNavItems = items.filter(
    (section) => section.section !== "Administration"
  );

  const renderNavItems = (items: NavItem[], inAccordion: boolean = false) => {
    return items.map((item) => (
      <TooltipProvider key={item.href} delayDuration={0}>
        <Tooltip
          open={(isCollapsed || item.disabled) && openTooltip === item.href}
          onOpenChange={(open) => {
            if (open) {
              setOpenTooltip(item.href);
            } else {
              setOpenTooltip(null);
            }
          }}
        >
          <TooltipTrigger asChild>
            {item.disabled ? (
              <div
                className={cn(
                  "group/item flex rounded-md transition-all duration-200 relative cursor-not-allowed",
                  isCollapsed
                    ? "w-10 h-10 justify-center items-center"
                    : "px-3 py-1.5 items-center",
                  "text-muted-foreground/30"
                )}
                onClick={() => setOpenTooltip(item.href)}
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
              </div>
            ) : (
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
            )}
          </TooltipTrigger>
          {(isCollapsed || item.disabled) && (
            <TooltipContent side="right" sideOffset={10}>
              <div className="flex flex-col gap-1">
                <span className="font-medium">{item.name}</span>
                {item.disabled && item.disabledReason ? (
                  <div className="text-xs text-amber-500 max-w-64">
                    <span className="font-medium">Required:</span>{" "}
                    {item.disabledReason}
                  </div>
                ) : (
                  item.description && (
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )
                )}
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    ));
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
          <div className="h-14 flex items-center justify-between border-b bg-muted/40 relative px-4">
            <DomainSwitcher
              currentDomain={domain}
              tenantId={tenant?.id}
              tenant={tenant}
              isLoading={isTenantLoading}
              collapsed={isCollapsed}
              adminNavItems={adminNavItems}
              getIcon={getIcon}
            />
            {!isCollapsed && (
              <div className="border-l h-8 pl-2 ml-2 flex items-center">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/o/dashboard/settings"
                        className={cn(
                          "flex items-center justify-center h-9 w-9 rounded-md transition-all",
                          pathname === "/o/dashboard/settings" ||
                            pathname.startsWith("/o/dashboard/settings/")
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
                        )}
                      >
                        <Cog className="h-4 w-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end">
                      Organization Setup
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
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

          {/* Nav items - filter out admin items as they're now in the dropdown */}
          <ScrollArea className="flex-1 py-2">
            <div className={cn("space-y-6", isCollapsed ? "px-2" : "px-4")}>
              {mainNavItems.map((section) => (
                <div key={section.section}>
                  {section.section ? (
                    isCollapsed ? (
                      <div className="space-y-1">
                        {renderNavItems(section.items)}
                      </div>
                    ) : (
                      <Accordion
                        type="multiple"
                        value={openSections}
                        onValueChange={setOpenSections}
                        className="space-y-1"
                      >
                        <AccordionItem
                          value={section.section}
                          className="border-none"
                        >
                          <AccordionTrigger className="py-1.5 text-xs font-medium text-muted-foreground/70 hover:no-underline">
                            {section.section}
                          </AccordionTrigger>
                          <AccordionContent className="pb-1 pt-0">
                            <div className="space-y-1">
                              {renderNavItems(section.items, true)}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )
                  ) : (
                    <div className="space-y-1">
                      {renderNavItems(section.items)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Auth Menu - Sticky Bottom */}
          <div className="h-14 border-t bg-muted/40">
            <div
              className={cn(
                "h-full flex items-center",
                isCollapsed ? "justify-center px-2" : "px-4"
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
                <div className="flex-1">
                  <DomainSwitcher
                    currentDomain={domain}
                    tenantId={tenant?.id}
                    tenant={tenant}
                    isLoading={isTenantLoading}
                    adminNavItems={adminNavItems}
                    getIcon={getIcon}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/o/dashboard/settings"
                          className={cn(
                            "flex items-center justify-center h-9 w-9 rounded-md transition-all",
                            pathname === "/o/dashboard/settings" ||
                              pathname.startsWith("/o/dashboard/settings/")
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

              {/* Mobile Nav Items */}
              <ScrollArea className="flex-1">
                <div className="space-y-6 p-4">
                  {mainNavItems.map((section) => (
                    <div key={section.section}>
                      {section.section ? (
                        <Accordion
                          type="multiple"
                          value={openSections}
                          onValueChange={setOpenSections}
                          className="space-y-1"
                        >
                          <AccordionItem
                            value={section.section}
                            className="border-none"
                          >
                            <AccordionTrigger className="py-1.5 text-xs font-medium text-muted-foreground/70 hover:no-underline">
                              {section.section}
                            </AccordionTrigger>
                            <AccordionContent className="pb-1 pt-0">
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
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ) : (
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
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

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
    </div>
  );
}
