import { Button } from "@/components/ui/button";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { getAvailablePortals } from "@/composites/dashboard/utils/dashboardUtils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

interface AvailablePortalsProps {
  domain: string;
  currentPortalType?: string | null;
  pathname: string;
}

export function AvailablePortals({
  domain,
  currentPortalType,
  pathname,
}: AvailablePortalsProps) {
  const { tenantUser } = useTenantAndUserAccessContext();

  const availablePortals = React.useMemo(() => {
    if (!tenantUser?.role?.access) return [];

    return getAvailablePortals(tenantUser.role.access);
  }, [tenantUser]);

  if (!availablePortals || availablePortals.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pb-4">
      <div className="space-y-2">
        <div className="text-xs font-medium text-sidebar-foreground/70 py-1">
          Portals
        </div>
        <div className="grid grid-cols-1 gap-2">
          {availablePortals.map((portal) => {
            const Icon = portal.icon;
            const isActive =
              currentPortalType === portal.type && currentPortalType !== null;

            return (
              <Button
                key={portal.type}
                variant="ghost"
                className={cn(
                  "h-auto p-3 justify-start text-left border transition-all duration-200",
                  isActive
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                    : "border-border/50 hover:border-border text-sidebar-foreground hover:text-foreground"
                )}
                asChild
              >
                <Link href={`/${portal.type}`}>
                  <div className="flex items-center gap-3 w-full">
                    <div
                      className={cn(
                        "p-1.5 rounded-md shrink-0 mt-0.5",
                        isActive ? "bg-primary/10" : "bg-muted/50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="font-medium text-sm leading-tight">
                      {portal.title}
                    </div>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
