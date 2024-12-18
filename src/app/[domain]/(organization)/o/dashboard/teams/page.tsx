"use client";

import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";

import TeamsTable from "./tables/TeamsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import AddTeamForm from "./forms/AddTeamForm";

export default function TeamsPage({ params }: { params: { domain: string } }) {
  const { data: tenant } = useTenantByDomain(params.domain);
  const {
    data: teams,
    error,
    isPending,
  } = useGetTeamsByTenantId(tenant?.id.toString() ?? "");

  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-3 ">
        <h3 className="text-lg ">Teams</h3>

        <Button
          size="icon"
          variant="outline"
          className="rounded-full"
          onClick={() => setIsAddTeamOpen(true)}
          type="button"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-start gap-3">
        {teams?.length === 0 ? (
          <Card className="border-dashed shadow-none w-full">
            <CardHeader>
              <CardTitle className="text-base">No teams found</CardTitle>
            </CardHeader>
          </Card>
        ) : (
          <TeamsTable
            teams={teams}
            tenantId={tenant?.id.toString() ?? ""}
            setIsAddTeamOpen={setIsAddTeamOpen}
          />
        )}

        <ResponsiveSheet
          isOpen={isAddTeamOpen}
          setIsOpen={setIsAddTeamOpen}
          title="Add team"
        >
          <AddTeamForm tenantId={tenant?.id.toString() ?? ""} />
        </ResponsiveSheet>
      </div>
    </div>
  );
}
