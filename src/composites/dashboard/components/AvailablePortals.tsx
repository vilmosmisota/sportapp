import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { getPortalTypeFromPath } from "@/composites/dashboard/types/portalConfigs";
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
  const [accordionValue, setAccordionValue] = React.useState<string[]>([
    "portals",
  ]);

  const availablePortals = React.useMemo(() => {
    if (!tenantUser?.role?.access) return [];

    return getAvailablePortals(tenantUser.role.access);
  }, [tenantUser]);

  // Detect current portal from pathname if currentPortalType is not provided or is null
  const detectedPortalType = React.useMemo(() => {
    if (currentPortalType) return currentPortalType;

    // Fallback: detect from pathname
    return getPortalTypeFromPath(pathname);
  }, [currentPortalType, pathname]);

  const currentPortal = React.useMemo(() => {
    if (!detectedPortalType || !availablePortals.length) return null;
    return availablePortals.find(
      (portal) => portal.type === detectedPortalType
    );
  }, [detectedPortalType, availablePortals]);

  const isLoading = !tenantUser?.role?.access;
  const isAccordionOpen = accordionValue.includes("portals");

  if (!isLoading && (!availablePortals || availablePortals.length === 0)) {
    return null;
  }

  const PortalSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-2 border border-border/50 rounded-lg"
        >
          <div className="p-1.5 rounded-md bg-muted/50 shrink-0">
            <Skeleton className="h-4 w-4" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`px-4 mx-4 pb-4  ${cn(
        isAccordionOpen ? "pb-4 bg-secondary-500/20" : "pb-0"
      )}  transition-all duration-100 rounded-lg`}
    >
      <Accordion
        type="multiple"
        value={accordionValue}
        onValueChange={setAccordionValue}
        className="w-full"
      >
        <AccordionItem value="portals" className="border-none">
          <AccordionTrigger className="py-2 text-xs font-medium text-sidebar-foreground/70 hover:no-underline hover:text-sidebar-foreground/90 transition-colors">
            <div className="flex items-center gap-2">
              <span>Portals</span>
              {!isAccordionOpen && currentPortal && (
                <>
                  <span className="text-sidebar-foreground/40">/</span>
                  <span className="text-sidebar-foreground font-medium">
                    {currentPortal.title}
                  </span>
                </>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0 pt-2">
            {isLoading ? (
              <PortalSkeleton />
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {availablePortals.map((portal) => {
                  const Icon = portal.icon;
                  const isActive =
                    detectedPortalType === portal.type &&
                    detectedPortalType !== null;

                  return (
                    <Button
                      key={portal.type}
                      variant="ghost"
                      className={cn(
                        "h-auto p-2 justify-start text-left border transition-all duration-200",
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
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
