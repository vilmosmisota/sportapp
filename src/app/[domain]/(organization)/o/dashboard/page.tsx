"use client";

import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { TenantHeader } from "@/components/ui/tenant-header";
import { Season } from "@/entities/season/Season.schema";
import { format, differenceInDays, isThisYear } from "date-fns";
import { Tag, CalendarDays, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import {
  getSeasonInfo,
  formatSeasonDateRange,
} from "@/entities/season/Season.utils";
import { ActiveSeasonBlock } from "../../../(components)/homepage/ActiveSeasonBlock";
import { TeamPlayerStatsBlock } from "../../../(components)/homepage/TeamPlayerStatsBlock";
import { UpcomingEventsBlock } from "@/components/calendar";

export default function OrgDashboardPage({
  params,
}: {
  params: { domain: string };
}) {
  const { data: tenant, isLoading: isTenantLoading } = useTenantByDomain(
    params.domain
  );
  const { data: seasons, isLoading: isSeasonsLoading } = useSeasonsByTenantId(
    tenant?.id?.toString() || ""
  );

  const isLoading = isTenantLoading || isSeasonsLoading;
  const activeSeason = seasons?.find((season) => season.isActive);

  return (
    <div className="space-y-6">
      <TenantHeader
        tenant={tenant}
        title="Dashboard"
        description="Your organization's dashboard."
        isLoading={isLoading}
      />

      <ActiveSeasonBlock activeSeason={activeSeason} isLoading={isLoading} />

      {tenant && (
        <TeamPlayerStatsBlock
          tenantId={tenant.id.toString()}
          isLoading={isLoading}
        />
      )}

      <UpcomingEventsBlock
        tenantId={tenant?.id?.toString() || ""}
        activeSeason={activeSeason || null}
        tenantName={tenant?.name || "Our Team"}
        isLoading={isLoading}
        domain={params.domain}
      />
    </div>
  );
}
