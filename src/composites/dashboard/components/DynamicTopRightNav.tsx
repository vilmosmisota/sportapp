"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogOut } from "@/entities/user/User.actions.client";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Building2,
  CircleUser,
  Cog,
  HelpCircle,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTenantAndUserAccessContext } from "../../auth/TenantAndUserAccessContext";
import { PortalType, TopRightNavConfig } from "../types/baseDashboard.types";

interface DynamicTopRightNavProps {
  isCollapsed?: boolean;
  portalType: PortalType;
  config?: TopRightNavConfig;
}

// Default configurations for each portal type
const DEFAULT_PORTAL_CONFIGS: Record<PortalType, TopRightNavConfig> = {
  [PortalType.MANAGEMENT]: {
    settingsLinks: [
      {
        href: "/management/settings/organization",
        label: "Organization",
        icon: Building2,
      },
      {
        href: "/management/settings/users",
        label: "Users",
        icon: Users,
      },
      {
        href: "/management/settings/roles",
        label: "Roles & Permissions",
        icon: ShieldCheck,
      },
    ],
    userProfileLinks: [
      {
        href: "/profile",
        label: "My Profile",
        icon: CircleUser,
      },
      {
        href: "/notifications",
        label: "Notifications",
        icon: Bell,
      },
      {
        href: "/settings",
        label: "Account Settings",
        icon: Settings,
      },
      {
        href: "/help",
        label: "Help & Support",
        icon: HelpCircle,
      },
    ],
    showNotifications: true,
  },
  [PortalType.ATTENDANCE]: {
    settingsLinks: [
      {
        href: "/attendance/settings",
        label: "Kiosk Settings",
        icon: Settings,
      },
    ],
    userProfileLinks: [
      {
        href: "/help",
        label: "Help & Support",
        icon: HelpCircle,
      },
    ],
    showNotifications: false,
  },
};

function DynamicTopRightNav({
  isCollapsed = false,
  portalType,
  config,
}: DynamicTopRightNavProps) {
  const { tenantUser, isLoading } = useTenantAndUserAccessContext();
  const logOutMutation = useLogOut();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Merge provided config with default config for the portal type
  const effectiveConfig = {
    ...DEFAULT_PORTAL_CONFIGS[portalType],
    ...config,
  };

  const handleSignOut = async () => {
    try {
      await logOutMutation.mutateAsync();
      queryClient.clear();
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (isLoading || !tenantUser?.user?.email) return null;

  const user = tenantUser.user;

  return (
    <div className="absolute flex flex-col h-8  top-2 right-4 z-50 ">
      <div
        className={cn(
          "flex h-full items-center justify-end gap-2 px-4 relative rounded-md transition-all duration-300",
          isCollapsed ? "bg-primary/10 backdrop-blur-sm" : ""
        )}
      >
        {/* Custom Actions */}
        {effectiveConfig.customActions && effectiveConfig.customActions}

        {/* Settings Dropdown */}
        {effectiveConfig.settingsLinks &&
          effectiveConfig.settingsLinks.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="smIcon">
                  <Cog className="h-4 w-4 text-sidebar-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs">
                  Settings
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {effectiveConfig.settingsLinks.map((link, index) => {
                    const IconComponent = link.icon;
                    return (
                      <DropdownMenuItem key={index} asChild>
                        <Link href={link.href} className="flex items-center">
                          <IconComponent className="mr-2 h-4 w-4" />
                          <span className="truncate flex-1">{link.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="smIcon">
              <UserRound className="h-4 w-4 text-sidebar-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {user && (
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs leading-none text-sidebar-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuGroup>
              {effectiveConfig.userProfileLinks?.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <DropdownMenuItem key={index} asChild>
                    <Link href={link.href} className="flex items-center">
                      <IconComponent className="mr-2 h-4 w-4" />
                      <span className="truncate flex-1">{link.label}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={logOutMutation.isPending}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>
                {logOutMutation.isPending ? "Signing out..." : "Log out"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default DynamicTopRightNav;
