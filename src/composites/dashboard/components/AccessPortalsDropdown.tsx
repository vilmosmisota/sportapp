"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { Access } from "@/entities/role/Role.schema";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface AccessPortal {
  id: string;
  title: string;
  href: string;
}

export function AccessPortalsDropdown() {
  const { tenant, tenantUser, isLoading } = useTenantAndUserAccessContext();
  const router = useRouter();
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<string[]>([]);

  const availablePortals = useMemo(() => {
    if (!tenant || !tenantUser) return [];

    const portals: AccessPortal[] = [];
    const isSystemAdmin = tenantUser.role?.access?.includes(Access.SYSTEM);

    portals.push({
      id: "user",
      title: "User Portal",
      href: `/user`,
    });

    const hasManagementAccess =
      isSystemAdmin || tenantUser.role?.access?.includes(Access.MANAGEMENT);

    if (hasManagementAccess) {
      portals.push({
        id: "management",
        title: "Management Portal",
        href: `/management`,
      });
    }

    // Kiosk Portal - requires kiosk access
    const hasKioskAccess =
      isSystemAdmin || tenantUser.role?.access?.includes(Access.KIOSK);

    if (hasKioskAccess) {
      portals.push({
        id: "kiosk",
        title: "Check-in Hub",
        href: `/kiosk`,
      });
    }

    return portals;
  }, [tenant, tenantUser]);

  const currentPortal = useMemo(() => {
    if (pathname.startsWith("/management")) return "management";
    if (pathname.startsWith("/kiosk")) return "kiosk";
    if (pathname.startsWith("/user")) return "user";

    return "user";
  }, [pathname]);

  const currentPortalInfo = availablePortals.find(
    (p) => p.id === currentPortal
  );

  const handlePortalChange = (href: string) => {
    router.push(href);
    setOpenSections([]); // Close accordion after selection
  };

  if (isLoading) {
    return (
      <div className="space-y-1 ml-6">
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (!tenant || !tenantUser || availablePortals.length <= 1) {
    return null;
  }

  return (
    <Accordion
      type="multiple"
      value={openSections}
      onValueChange={setOpenSections}
      className="space-y-1"
    >
      <AccordionItem value="portals" className="border-none ml-6">
        <AccordionTrigger className="py-2 px-3 text-sm font-medium hover:no-underline hover:bg-accent rounded-md">
          <div className="flex items-center w-full justify-center">
            <span className="text-sm font-medium truncate">
              {currentPortalInfo?.title || "Select Portal"}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-1 pt-0">
          <div className="space-y-1">
            {availablePortals
              .filter((portal) => portal.id !== currentPortal)
              .map((portal) => {
                return (
                  <Link
                    key={portal.id}
                    href={portal.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePortalChange(portal.href);
                    }}
                    className={cn(
                      "group/item flex rounded-md transition-all duration-200 relative px-3 py-2 items-center justify-center",
                      "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <span className="text-sm font-medium truncate">
                      {portal.title}
                    </span>
                  </Link>
                );
              })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
