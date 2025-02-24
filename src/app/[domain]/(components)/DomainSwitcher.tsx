"use client";

import { useCurrentUser } from "@/entities/user/User.query";
import { RoleDomain } from "@/entities/role/Role.permissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTenantFeatures } from "@/entities/tenant/TenantFeatures.query";

interface DomainSwitcherProps {
  currentDomain: string;
  collapsed?: boolean;
  tenantId?: number;
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

export function DomainSwitcher({
  currentDomain,
  collapsed = false,
  tenantId,
}: DomainSwitcherProps) {
  const { data: user, isLoading } = useCurrentUser();
  const pathname = usePathname();
  const { data: features, error } = useTenantFeatures(tenantId ?? 0);

  if (isLoading || !user || !tenantId) return null;

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {collapsed ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 hover:bg-accent/50"
          >
            <MenuIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="px-2 hover:bg-accent/50">
            <MenuIcon className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                Switch Dashboard
              </p>
              {hasSystemRole && (
                <p className="text-xs text-muted-foreground">
                  System access enabled
                </p>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Show all accessible domains */}
        {(hasSystemRole
          ? Object.values(RoleDomain).filter(
              (domain) => domain !== RoleDomain.SYSTEM
            )
          : availableDomains
        ).map((domain) => {
          const DomainIcon = domainIcons[domain];
          const isActive = domain === activeDomain;

          return (
            <DropdownMenuItem
              key={domain}
              asChild
              className={cn(
                "flex items-center justify-between py-3",
                isActive && "bg-accent"
              )}
            >
              <Link href={domainRoutes[domain]}>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 flex items-center justify-center rounded-md border bg-background">
                    <DomainIcon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {domainLabels[domain]} Dashboard
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isActive ? "Current view" : "Switch view"}
                    </span>
                  </div>
                </div>
                {isActive ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </Link>
            </DropdownMenuItem>
          );
        })}

        {/* Website Section - Only show if website builder is enabled */}
        {features?.websiteBuilder === true && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Website
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center gap-2 py-3">
                  <div className="h-8 w-8 flex items-center justify-center rounded-md border bg-background">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Public Site</span>
                    <span className="text-xs text-muted-foreground">
                      View your public website
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild disabled>
                <Link
                  href="/o/dashboard/website"
                  className="flex items-center gap-2 py-3"
                >
                  <div className="h-8 w-8 flex items-center justify-center rounded-md border bg-background">
                    <Hammer className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Website Builder
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        Soon
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Customize your website
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
