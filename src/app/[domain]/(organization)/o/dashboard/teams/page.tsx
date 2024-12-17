"use client";

import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import AddTeamsheet from "./sheets/AddTeamsheet";

import TeamsTable from "./tables/TeamsTable";

export default function TeamsPage({ params }: { params: { domain: string } }) {
  const { data: tenant } = useTenantByDomain(params.domain);
  const {
    data: teams,
    error,
    isPending,
  } = useGetTeamsByTenantId(tenant?.id.toString() ?? "");

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="w-full">
      <h3 className="text-2xl mb-3">Teams</h3>
      {teams?.length === 0 ? (
        <div className="w-full h-full min-h-[500px] flex items-center justify-center border-dashed border rounded-md text-center">
          <div>
            <h3 className="text-xl mb-3">No teams found</h3>
            <AddTeamsheet tenantId={tenant?.id.toString() ?? ""} />
          </div>
        </div>
      ) : (
        <TeamsTable teams={teams} tenantId={tenant?.id.toString() ?? ""} />
      )}
    </div>
  );
}
