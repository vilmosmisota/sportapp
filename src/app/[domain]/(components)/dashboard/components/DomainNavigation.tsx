import React, { useState } from "react";
import { usePathname } from "next/navigation";
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
import { ChevronDown, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "../../../../../lib/utils";
import { Skeleton } from "../../../../../components/ui/skeleton";

interface DomainNavigationProps {
  currentDomain: string;
  tenantId?: number;
  isLoading?: boolean;
}

const domainLabels: Record<RoleDomain, string> = {
  [RoleDomain.MANAGEMENT]: "Management",
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

function DomainNavSkeleton() {
  return (
    <div className="flex items-center justify-between w-full py-1.5 px-2 rounded-md">
      <div className="w-full flex items-center justify-center">
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-4 shrink-0 ml-2" />
    </div>
  );
}

export function DomainNavigation({
  currentDomain,
  tenantId,
  isLoading = false,
}: DomainNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const pathname = usePathname();

  if (userLoading || isLoading || !tenantId) {
    return <DomainNavSkeleton />;
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
        <button className="flex items-center justify-between  w-full  hover:bg-accent/30 py-1.5 px-2 rounded-md transition-colors text-center">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium">
              {domainLabels[activeDomain]}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs">Switch View</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {domainOptions.map((domain) => {
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
                  <span className="truncate flex-1">{label}</span>
                  {isActive && (
                    <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
