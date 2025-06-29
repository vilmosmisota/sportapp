"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { useLogOut } from "@/entities/user/User.actions.client";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, HelpCircle, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardAuthMenuProps {
  collapsed?: boolean;
  className?: string;
}

const leftQuickActions = [
  {
    icon: Bell,
    label: "Notifications",
    href: "/user/notifications",
  },
];

const rightQuickActions = [
  {
    icon: HelpCircle,
    label: "Help",
    href: "/user/help",
  },
];

export function DashboardAuthMenu({
  collapsed = false,
  className,
}: DashboardAuthMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tenantUser, isLoading } = useTenantAndUserAccessContext();
  const logOutMutation = useLogOut();

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
  const role = tenantUser.role;

  if (collapsed) {
    return (
      <DropdownMenu>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <UserRound className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              Account Menu
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                {role?.name || "Member"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/user/profile" className="flex items-center">
              <UserRound className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/user/notifications" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/user/help" className="flex items-center">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <UserRound className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {role?.name || "Member"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/user/profile" className="flex items-center">
                <UserRound className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {leftQuickActions.map((action) => (
          <TooltipProvider key={action.href} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                  <Link href={action.href}>
                    <action.icon className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{action.label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      <div className="flex items-center">
        {rightQuickActions.map((action) => (
          <TooltipProvider key={action.href} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                  <Link href={action.href}>
                    <action.icon className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{action.label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}
