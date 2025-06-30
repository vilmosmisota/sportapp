import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { getPortalTypeFromPath } from "@/composites/dashboard/types/portalConfigs";
import { getAvailablePortals } from "@/composites/dashboard/utils/dashboardUtils";
import { cn } from "@/lib/utils";
import { Building2, Grid3X3 } from "lucide-react";
import Link from "next/link";
import React from "react";

interface CollapsedPortalDropdownProps {
  isCollapsed: boolean;
  domain: string;
  currentPortalType?: string | null;
  pathname: string;
}

export function CollapsedPortalDropdown({
  isCollapsed,
  domain,
  currentPortalType,
  pathname,
}: CollapsedPortalDropdownProps) {
  const { tenantUser } = useTenantAndUserAccessContext();

  const availablePortals = React.useMemo(() => {
    if (!tenantUser?.role?.access) return [];
    return getAvailablePortals(tenantUser.role.access);
  }, [tenantUser]);

  // Detect current portal from pathname if currentPortalType is not provided or is null
  const detectedPortalType = React.useMemo(() => {
    if (currentPortalType) return currentPortalType;
    return getPortalTypeFromPath(pathname);
  }, [currentPortalType, pathname]);

  const currentPortal = React.useMemo(() => {
    if (!detectedPortalType || !availablePortals.length) return null;
    return availablePortals.find(
      (portal) => portal.type === detectedPortalType
    );
  }, [detectedPortalType, availablePortals]);

  // Check if we're on the home page (platform)
  const isOnHomePage = !detectedPortalType || pathname === `/`;

  // Only show when collapsed and we have portals or when we're in a portal
  if (!isCollapsed || (!availablePortals.length && !isOnHomePage)) {
    return null;
  }

  const CurrentPortalIcon = currentPortal?.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="smIcon"
          className="text-sidebar-foreground hover:text-primary"
          aria-label="Switch portal"
        >
          {isOnHomePage ? (
            <Building2 className="h-4 w-4" />
          ) : CurrentPortalIcon ? (
            <CurrentPortalIcon className="h-4 w-4" />
          ) : (
            <Grid3X3 className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="w-56">
        <DropdownMenuLabel className="text-xs">Switch Portal</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Platform (Home) Option */}
        <DropdownMenuItem asChild>
          <Link
            href={`/`}
            className={cn(
              "flex items-center cursor-pointer",
              isOnHomePage && "bg-primary/5 text-primary"
            )}
          >
            <div
              className={cn(
                "p-1.5 rounded-md shrink-0 mr-3",
                isOnHomePage ? "bg-primary/10" : "bg-muted/50"
              )}
            >
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Platform</span>
            </div>
          </Link>
        </DropdownMenuItem>

        {/* Portal Options */}
        {availablePortals.map((portal) => {
          const Icon = portal.icon;
          const isActive = detectedPortalType === portal.type;

          return (
            <DropdownMenuItem key={portal.type} asChild>
              <Link
                href={`/${portal.type}`}
                className={cn(
                  "flex items-center cursor-pointer",
                  isActive && "bg-primary/5 text-primary"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-md shrink-0 mr-3",
                    isActive ? "bg-primary/10" : "bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{portal.title}</span>
                </div>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
