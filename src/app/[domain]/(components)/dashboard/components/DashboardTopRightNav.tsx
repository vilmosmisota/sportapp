import React from "react";
import { cn } from "../../../../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "../../../../../components/ui/dropdown-menu";
import Link from "next/link";
import { Button } from "../../../../../components/ui/button";
import {
  Cog,
  UserRound,
  Users,
  ShieldCheck,
  Building2,
  CircleUser,
  Bell,
  HelpCircle,
  LogOut,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "../../../../../entities/user/User.query";

interface DashboardTopRightNavProps {
  isCollapsed?: boolean;
}

function DashboardTopRightNav({
  isCollapsed = false,
}: DashboardTopRightNavProps) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();

  return (
    <div className="absolute flex flex-col h-12 px-4 top-0 right-0 z-50 pt-4">
      <div
        className={cn(
          "flex h-full items-center justify-end gap-2 px-4  relative rounded-md transition-all duration-300",
          isCollapsed ? "bg-primary/10 backdrop-blur-sm" : ""
        )}
      >
        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="smIcon">
              <Cog className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs">
              Organization Settings
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/o/dashboard/settings"
                  className="flex items-center"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="truncate flex-1">General Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/o/dashboard/settings/users"
                  className="flex items-center"
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span className="truncate flex-1">Users</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/o/dashboard/settings/roles"
                  className="flex items-center"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  <span className="truncate flex-1">Roles & Permissions</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/o/dashboard/settings/organization"
                  className="flex items-center"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span className="truncate flex-1">Organization Details</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="smIcon">
              <UserRound className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {user && (
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/auth/profile" className="flex items-center">
                  <CircleUser className="mr-2 h-4 w-4" />
                  <span className="truncate flex-1">My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth/notifications" className="flex items-center">
                  <Bell className="mr-2 h-4 w-4" />
                  <span className="truncate flex-1">Notifications</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="truncate flex-1">Account Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth/help" className="flex items-center">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span className="truncate flex-1">Help & Support</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default DashboardTopRightNav;
