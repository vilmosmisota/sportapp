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
  ChevronDown,
  Cog,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTenantFeatures } from "@/entities/tenant/TenantFeatures.query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Tenant } from "@/entities/tenant/Tenant.schema";

interface NavItem {
  name: string;
  href: string;
  iconName: string;
  description?: string;
  disabled?: boolean;
  disabledReason?: string;
}

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

  if (userLoading || !user || !tenantId) return null;

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
          <button className="flex items-center gap-3 hover:bg-accent/30 py-1 px-2 rounded-md transition-colors group/tenant">
            <div className="flex items-center gap-3">
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

              <div className="flex flex-col items-start">
                <span className="font-semibold text-sm">
                  {!isLoading ? tenant?.name : "Loading..."}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {activeDomain}
                </span>
              </div>
            </div>
            <ChevronDown
              size={16}
              className={cn(
                "text-muted-foreground ml-1 transition-transform",
                isOpen && "transform rotate-180"
              )}
            />
          </button>
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
        {domainOptions.length > 0 &&
          domainOptions.map((domain) => {
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
                <Link
                  href={domainRoutes[domain]}
                  onClick={() => setIsOpen(false)}
                >
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
                <Link
                  href="/"
                  className="flex items-center gap-2 py-3"
                  onClick={() => setIsOpen(false)}
                >
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
                  onClick={() => setIsOpen(false)}
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

        {/* Administration Section */}
        {(adminNavItems.length > 0 || collapsed) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Administration
              </DropdownMenuLabel>
              {collapsed && (
                <DropdownMenuItem asChild>
                  <Link
                    href="/o/dashboard/settings"
                    className="flex items-center gap-x-3 py-3"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="h-8 w-8 flex items-center justify-center rounded-md border bg-background">
                      <Cog className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        Organization Setup
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Configure organization settings
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              )}
              {adminNavItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className="flex items-center gap-x-3 py-3"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="h-8 w-8 flex items-center justify-center rounded-md border bg-background">
                      {getIcon ? getIcon(item.iconName) : null}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.name}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
