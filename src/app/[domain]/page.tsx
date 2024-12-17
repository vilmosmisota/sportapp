import LeagueLandingPage from "./(league)/Landing.page";
import { TenantType } from "@/entities/tenant/Tenant.schema";
import OrganizationLandingPage from "./(organization)/OrganizationLanding.page";
import { getTenantByDomain } from "@/entities/tenant/Tenant.services";
import { getServerClient } from "@/libs/supabase/server";

export default async function TenantLandingPage({
  params,
}: {
  params: { domain: string };
}) {
  const serverClient = getServerClient();
  const tenant = await getTenantByDomain(params.domain, serverClient);

  if (!tenant) {
    return null;
  }

  const { type: tenantType } = tenant;

  return (
    <div className="my-5 px-5">
      {tenantType === TenantType.LEAGUE && (
        <LeagueLandingPage params={params} />
      )}
      {tenantType === TenantType.ORGANIZATION && <OrganizationLandingPage />}
    </div>
  );
}
