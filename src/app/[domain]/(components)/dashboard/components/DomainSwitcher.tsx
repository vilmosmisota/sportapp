"use client";

import { useCurrentUser } from "../../../../../entities/user/User.query";
import { RoleDomain } from "../../../../../entities/role/Role.permissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "../../../../../components/ui/dropdown-menu";
import { Button } from "../../../../../components/ui/button";
import {
  MenuIcon,
  Building2,
  Users,
  UserRound,
  ChevronRight,
  CheckCircle2,
  Shield,
  Globe,
  Hammer,
  ChevronDown,
  Cog,
} from "lucide-react";
import Link from "next/link";
import { cn } from "../../../../../lib/utils";
import { Badge } from "../../../../../components/ui/badge";
import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTenantFeatures } from "../../../../../entities/tenant/TenantFeatures.query";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../../components/ui/avatar";
import { useState } from "react";
import { Tenant } from "../../../../../entities/tenant/Tenant.schema";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { NavItem } from "../constants";

interface DomainSwitcherProps {
  currentDomain: string;
  collapsed?: boolean;
  tenantId?: number;
  tenant?: Tenant;
  isLoading?: boolean;
  adminNavItems?: NavItem[];
  getIcon?: (iconName: string) => React.ReactNode;
}

const domainIcons: Record<RoleDomain, LucideIcon> = {
  [RoleDomain.MANAGEMENT]: Building2,
  [RoleDomain.FAMILY]: Users,
  [RoleDomain.PLAYER]: UserRound,
  [RoleDomain.SYSTEM]: Shield,
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

function DomainSwitcherSkeleton({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  if (collapsed) {
    return (
      <div className="flex items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full py-1 px-2 rounded-md">
      <div className="flex items-center gap-3 min-w-0">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-4 shrink-0" />
    </div>
  );
}

export function DomainSwitcher({
  collapsed = false,
  tenantId,
  tenant,
  isLoading = false,
  adminNavItems = [],
  getIcon,
}: DomainSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const pathname = usePathname();
  const { data: features } = useTenantFeatures(tenantId ?? 0);

  if (userLoading || isLoading || !tenantId) {
    return <DomainSwitcherSkeleton collapsed={collapsed} />;
  }

  if (!user) return null;

  // Check if user has system role
  const hasSystemRole = user.roles?.some(
    (role) => role.role?.domain === RoleDomain.SYSTEM
  );

  // Get all available domains for the current tenant
  const currentTenantRoles = user.roles?.filter(
    (role) => role.tenantId === tenantId
  );

  // Get unique domains (excluding SYSTEM as it's handled separately)
  const availableDomains = Array.from(
    new Set(
      currentTenantRoles
        ?.map((role) => role.role?.domain)
        .filter(
          (domain): domain is RoleDomain =>
            !!domain && domain !== RoleDomain.SYSTEM
        )
    )
  );

  // Get primary role for current tenant
  const primaryRole = currentTenantRoles?.find((role) => role.isPrimary);
  const currentDomain_ = primaryRole?.role?.domain || RoleDomain.MANAGEMENT;

  // Get current route type
  const getCurrentDomainFromPath = () => {
    if (pathname.startsWith("/o/")) return RoleDomain.MANAGEMENT;
    if (pathname.startsWith("/f/")) return RoleDomain.FAMILY;
    if (pathname.startsWith("/p/")) return RoleDomain.PLAYER;
    return currentDomain_;
  };

  const activeDomain = getCurrentDomainFromPath();

  // Determine which domains to show
  const domainOptions = hasSystemRole
    ? Object.values(RoleDomain).filter((domain) => domain !== RoleDomain.SYSTEM)
    : availableDomains;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {collapsed ? (
          <button
            className="flex items-center justify-center"
            onClick={() => setIsOpen(true)}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={tenant?.logo ? tenant.logo : ""} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {tenant?.name ? tenant?.name.slice(0, 2).toUpperCase() : "N/A"}
              </AvatarFallback>
            </Avatar>
          </button>
        ) : (
          <button className="flex items-center justify-between w-full hover:bg-accent/30 py-1 px-2 rounded-md transition-colors group/tenant gap-2">
            <div className="flex items-center gap-3 min-w-0">
              {tenant?.logo && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={tenant?.logo ? tenant.logo : ""} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {tenant?.name
                      ? tenant?.name.slice(0, 2).toUpperCase()
                      : "N/A"}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="flex flex-col items-start min-w-0">
                <span className="font-semibold text-sm break-words max-w-[200px]">
                  {!isLoading ? tenant?.name : "Loading..."}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {activeDomain}
                </span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover/tenant:text-primary shrink-0 transition-colors" />
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={tenant?.logo ? tenant.logo : ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {tenant?.name ? tenant?.name.slice(0, 2).toUpperCase() : "N/A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-xs">{tenant?.name}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {domainOptions.map((domain) => {
            const DomainIcon = domainIcons[domain];
            const label = domainLabels[domain];
            const route = domainRoutes[domain];
            const isActive = domain === activeDomain;

            return (
              <DropdownMenuItem
                key={domain}
                asChild
                className={cn("gap-2", isActive && "bg-accent")}
              >
                <Link href={route} className="flex items-center">
                  <DomainIcon className="mr-2 h-4 w-4" />
                  <span className="truncate flex-1">{label} Dashboard</span>
                  {isActive && (
                    <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {hasSystemRole && (
          <>
            <DropdownMenuLabel className="text-xs font-medium">
              Organization Settings
            </DropdownMenuLabel>

            {adminNavItems?.map((item) => {
              const isActive = pathname === item.href;
              return (
                <DropdownMenuItem
                  key={item.href}
                  asChild
                  className={cn("gap-2", isActive && "bg-accent")}
                  disabled={item.disabled}
                >
                  <Link href={item.href} className="flex items-center">
                    {getIcon && getIcon(item.iconName)}
                    <span className="truncate flex-1">{item.name}</span>
                    {isActive ? (
                      <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    )}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="gap-2" asChild>
          <Link href="/o/dashboard/settings" className="flex items-center">
            <Cog className="mr-2 h-4 w-4" />
            Organization Setup
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
