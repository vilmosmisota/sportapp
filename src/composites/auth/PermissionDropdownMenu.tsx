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
import { Access } from "@/entities/role/Role.schema";
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
  trigger?: ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
  buttonClassName?: string;
}

export function PermissionDropdownMenu({
  actions,
  trigger,
  align = "end",
  className,
  buttonClassName,
}: PermissionDropdownMenuProps) {
  const { tenantUser, isLoading, error } = useTenantAndUserAccessContext();

  if (isLoading || error) {
    return null;
  }

  if (!tenantUser?.user) {
    return null;
  }

  const userAccess = tenantUser.role?.access || [];
  const hasSystemAccess = userAccess.includes(Access.SYSTEM);

  const visibleActions = actions.filter((action) => {
    if (!action.permission) return true;

    if (hasSystemAccess) return true;

    const hasPermission =
      tenantUser.role?.permissions.includes(action.permission) ?? false;
    return hasPermission;
  });

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
