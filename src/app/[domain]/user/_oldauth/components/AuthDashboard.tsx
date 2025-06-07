"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLogOut } from "@/entities/user/User.actions.client";
import { useCurrentUser } from "@/entities/user/User.query";
import { cn } from "@/libs/tailwind/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Globe,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

const iconMap = {
  UserRound,
  Settings,
  Bell,
  HelpCircle,
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

interface AuthDashboardProps {
  items: NavSection[];
  children: React.ReactNode;
}

export default function AuthDashboard({ items, children }: AuthDashboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const logOutMutation = useLogOut();

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setOpenTooltip(null);
  };

  const handleSignOut = async () => {
    try {
      await logOutMutation.mutateAsync();
      queryClient.clear();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };

  if (isLoading || !user) return null;

  const initials = user.email
    ? user.email
        .split("@")[0]
        .split(".")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "N/A";

  // Get primary role or fall back to first role
  const primaryRole = user.roles?.find((role) => role.isPrimary);
  const displayRole = primaryRole || user.roles?.[0];

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
          {/* Header area with user info */}
          <div className="h-14 flex items-center border-b bg-muted/40">
            <div
              className={cn(
                "flex items-center justify-between w-full transition-all duration-300 h-full",
                isCollapsed ? "pl-2" : "pl-4"
              )}
            >
              {!isCollapsed ? (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium truncate">
                        {user.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {displayRole?.role?.name || "Member"}
                      </span>
                    </div>
                  </div>
                  <div className="border-l h-full flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 hover:bg-accent/50"
                        >
                          <MenuIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {user.email}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {displayRole?.role?.name || "Member"}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href="/"
                            className={cn(
                              "flex items-center",
                              pathname === "/" && "bg-accent"
                            )}
                          >
                            <Globe className="mr-2 h-4 w-4" />
                            Public Site
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href=/management"
                            className={cn(
                              "flex items-center",
                              pathname.includes(/management") && "bg-accent"
                            )}
                          >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-10 h-10 p-0 hover:bg-accent/50"
                    >
                      <MenuIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {displayRole?.role?.name || "Member"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/"
                        className={cn(
                          "flex items-center",
                          pathname === "/" && "bg-accent"
                        )}
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Public Site
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href=/management"
                        className={cn(
                          "flex items-center",
                          pathname.includes(/management") && "bg-accent"
                        )}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                                  <span className="text-sm font-medium capitalize">
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
                                <span className="font-medium capitalize">
                                  {item.name}
                                </span>
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

          {/* Logout Button */}
          <div className="h-14 border-t bg-muted/40">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className={cn(
                "w-full h-full flex items-center gap-2",
                isCollapsed ? "justify-center px-0" : "justify-start px-4",
                "text-red-600 hover:text-red-600 hover:bg-red-600/10"
              )}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Sign Out</span>}
            </Button>
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
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate">
                      {user.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {displayRole?.role?.name || "Member"}
                    </span>
                  </div>
                </div>
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
                              <span className="capitalize">{item.name}</span>
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

              {/* Mobile Logout Button */}
              <div className="h-14 border-t bg-muted/40">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full h-full flex items-center justify-start px-4 gap-2 text-red-600 hover:text-red-600 hover:bg-red-600/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
