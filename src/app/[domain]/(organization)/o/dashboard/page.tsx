"use client";

import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { TenantHeader } from "@/components/ui/tenant-header";

import { ActiveSeasonBlock } from "../../../(components)/homepage/ActiveSeasonBlock";
import { TeamPlayerStatsBlock } from "../../../(components)/homepage/TeamPlayerStatsBlock";
import { UpcomingEventsBlock } from "@/components/calendar";
import { useTenantAndUserAccessContext } from "@/components/auth/TenantAndUserAccessContext";

export default function OrgDashboardPage({
  params,
}: {
  params: { domain: string };
}) {
  const { tenant } = useTenantAndUserAccessContext();

  const { data: seasons, isLoading: isSeasonsLoading } = useSeasonsByTenantId(
    tenant?.id?.toString() || ""
  );

  const isLoading = isSeasonsLoading;
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
