"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Permission } from "@/entities/role/Role.permissions";
import { UserDomain } from "@/entities/user/User.schema";
import { cn } from "@/libs/tailwind/utils";
import { MoreVertical } from "lucide-react";
import { Fragment, ReactNode } from "react";
import { useTenantAndUserAccessContext } from "./TenantAndUserAccessContext";

export interface MenuAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  permission?: Permission;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

interface PermissionDropdownMenuProps {
  actions: MenuAction[];
  allowSystemRole?: boolean;
  trigger?: ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
  buttonClassName?: string;
}

export function PermissionDropdownMenu({
  actions,
  allowSystemRole = true,
  trigger,
  align = "end",
  className,
  buttonClassName,
}: PermissionDropdownMenuProps) {
  const { user, isLoading, error } = useTenantAndUserAccessContext();

  // If loading or error, don't show menu
  if (isLoading || error) {
    return null;
  }

  // If no user data, don't show menu
  if (!user) {
    return null;
  }

  // Check if user has system domain
  const hasSystemDomain =
    user.userDomains?.includes(UserDomain.SYSTEM) ?? false;

  // Filter actions based on permissions
  const visibleActions = actions.filter((action) => {
    // If no permission required, show the action
    if (!action.permission) return true;

    // System domain users always have access
    if (hasSystemDomain) return true;

    // Check specific permission in user's role
    const hasPermission =
      user.role?.permissions.includes(action.permission) ?? false;
    return hasPermission;
  });

  // If no visible actions, don't show menu
  if (!visibleActions.length) {
    return null;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            className={cn(
              "h-8 w-8 p-0 hover:bg-background/20 data-[state=open]:bg-background/20",
              buttonClassName
            )}
            size="sm"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={cn("w-[160px]", className)}>
        {visibleActions.map((action, index) => (
          <Fragment key={action.label}>
            <DropdownMenuItem
              className="group flex w-full items-center justify-between text-left p-0 text-sm font-medium text-neutral-700"
              disabled={action.disabled}
            >
              <button
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  "w-full justify-start items-center gap-2 flex rounded-md p-2 transition-all duration-75 hover:bg-gray-100",
                  action.variant === "destructive" && "text-red-500",
                  action.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {action.icon}
                {action.label}
              </button>
            </DropdownMenuItem>
            {index < visibleActions.length - 1 && <DropdownMenuSeparator />}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
