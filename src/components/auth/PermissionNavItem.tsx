"use client";

import { useCurrentUser } from "@/entities/user/User.query";
import { Permission, RoleDomain } from "@/entities/role/Role.permissions";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface PermissionNavItemProps {
  name: string;
  href: string;
  description?: string;
  permissions?: Permission[];
  allowSystemRole?: boolean;
  children?: React.ReactNode;
}

export function PermissionNavItem({
  name,
  href,
  description,
  permissions = [],
  allowSystemRole = false,
  children,
}: PermissionNavItemProps) {
  const { data: user, isLoading } = useCurrentUser();
  const pathname = usePathname();

  if (isLoading || !user) {
    return null;
  }

  // Check if user has system role
  const hasSystemRole = (user.roles || []).some(
    (userRole) => userRole.role?.domain === RoleDomain.SYSTEM
  );

  if (allowSystemRole && hasSystemRole) {
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
          pathname === href ? "bg-accent" : "transparent"
        )}
      >
        {children && <div className="h-4 w-4 shrink-0">{children}</div>}
        <div className="flex flex-col">
          <span>{name}</span>
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      </Link>
    );
  }

  // Check if user has any of the required permissions
  const hasPermission =
    permissions.length === 0 ||
    (user.roles || []).some((userRole) =>
      userRole.role?.permissions.some((permission) =>
        permissions.includes(permission)
      )
    );

  if (!hasPermission) {
    return null;
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
        pathname === href ? "bg-accent" : "transparent"
      )}
    >
      {children && <div className="h-4 w-4 shrink-0">{children}</div>}
      <div className="flex flex-col">
        <span>{name}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
    </Link>
  );
}
