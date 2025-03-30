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
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useState } from "react";
import { Menu as MenuIcon } from "lucide-react";
import { DashboardAuthMenu } from "./DashboardAuthMenu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useCurrentUser } from "@/entities/user/User.query";
import { RoleDomain } from "@/entities/role/Role.permissions";
import { useTenantFeatures } from "@/entities/tenant/TenantFeatures.query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DomainSwitcher } from "./DomainSwitcher";

function DecorativeCorner() {
  return (
    <div
      className="fixed right-0 top-4 z-30 h-8 w-[140px] overflow-hidden"
      style={{ clipPath: "inset(0px 0px 0px 0px)" }}
    >
      {/* Background layer */}
      <div
        className="absolute inset-0"
        style={{
          transform: "skewX(30deg)",
          transformOrigin: "top left",
          clipPath:
            "path('M0,0c6,0,10.7,4.7,10.7,10.7v10.7c0,5.9,4.8,10.7,10.7,10.7H140V0')",
        }}
      />

      {/* Border layer */}
      <div
        className="pointer-events-none absolute top-0 z-10 h-full w-full origin-top transition-all"
        style={{
          transform: "skewX(30deg)",
          transformOrigin: "top left",
        }}
      >
        <svg
          className="absolute h-full w-full"
          viewBox="0 0 140 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,0c6,0,10.7,4.7,10.7,10.7v10.7c0,5.9,4.8,10.7,10.7,10.7H140V0"
            stroke="hsl(var(--primary) / 0.1)"
            strokeWidth="1"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="18"
            y1="32"
            x2="120"
            y2="32"
            stroke="hsl(var(--primary) / 0.1)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}

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

interface NavItemProps {
  item: NavItem;
  isCollapsed?: boolean;
  pathname: string;
}

function NavItem({ item, isCollapsed, pathname }: NavItemProps) {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const Icon = iconMap[item.iconName as keyof typeof iconMap];

  if (item.disabled) {
    return (
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
                {Icon && <Icon className="h-4 w-4" />}
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">
                    {item.name}
                  </span>
                )}
              </div>
            </div>
          </TooltipTrigger>
          {isCollapsed && (
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
    );
  }

  return (
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
              {Icon && <Icon className="h-4 w-4" />}
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
  );
}

interface NavItemsProps {
  items: NavItem[];
  isCollapsed?: boolean;
  pathname: string;
}

function NavItems({ items, isCollapsed, pathname }: NavItemsProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <NavItem
          key={item.href}
          item={item}
          isCollapsed={isCollapsed}
          pathname={pathname}
        />
      ))}
    </div>
  );
}

export default function Dashboard({ items, children }: DashboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);

  const pathname = usePathname();
  const params = useParams();
  const domain = params.domain as string;

  const { data: tenant, isLoading: isTenantLoading } =
    useTenantByDomain(domain);

  // Find non-admin navigation items
  const mainNavItems = items.filter(
    (section) => section.section !== "Administration"
  );

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };

  return (
    <div className="flex min-h-screen relative">
      <div className="absolute flex flex-col  h-12 top-0 left-0 z-50 pt-4 ">
        <div className="flex h-full items-center justify-end gap-2  px-4 relative ">
          {/* Pinned menu items will come here with smIcon buttons form */}
        </div>
      </div>

      <div className="absolute flex flex-col  h-12 top-0 right-0 z-50 pt-4 ">
        <div className="flex h-full items-center justify-end gap-2  px-4 relative ">
          <Button variant="ghost" size="smIcon">
            <Cog className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="smIcon">
            <UserRound className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "group hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 z-20 mt",
          isCollapsed ? "lg:w-16" : "lg:w-72"
        )}
      >
        <div className="flex flex-col h-full  relative pt-4">
          {/* Header area with branding and navigation */}
          <div className="px-4">
            <DomainSwitcher
              currentDomain={domain}
              isLoading={isTenantLoading}
              getIcon={getIcon}
              tenant={tenant}
              tenantId={tenant?.id}
            />
          </div>

          {/* Nav items - filter out admin items as they're now in the dropdown */}
          <ScrollArea className="flex-1 py-2 pt-6 ">
            <div className={cn("space-y-6", isCollapsed ? "px-2" : "px-4")}>
              {mainNavItems.map((section) => (
                <div key={section.section}>
                  {section.section ? (
                    isCollapsed ? (
                      <NavItems
                        items={section.items}
                        isCollapsed={isCollapsed}
                        pathname={pathname}
                      />
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
                            <NavItems
                              items={section.items}
                              isCollapsed={isCollapsed}
                              pathname={pathname}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )
                  ) : (
                    <NavItems
                      items={section.items}
                      isCollapsed={isCollapsed}
                      pathname={pathname}
                    />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Collapse/Expand Button */}
          <div
            className={cn(
              "h-14 flex items-center",
              isCollapsed ? "justify-center" : "px-4"
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
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300 relative pt-4",
          isCollapsed ? "lg:pl-16" : "lg:pl-72"
        )}
      >
        <DecorativeCorner />

        <div className="h-[calc(100dvh-1rem)] flex flex-col bg-white relative border-l border-t border-primary/10 rounded-tl-lg ">
          <ScrollArea className="h-full">
            <main className="pb-6 pt-12   h-full">
              <div className="px-4">{children}</div>
            </main>
          </ScrollArea>
        </div>
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
                <div className="flex-1"></div>
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
