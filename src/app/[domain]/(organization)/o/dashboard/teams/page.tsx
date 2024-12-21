"use client";

import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import TeamsTable from "./tables/TeamsTable";
import AddTeamForm from "./forms/AddTeamForm";
import TeamsTableFilters from "./tables/TeamsTableFilters";
import { useUserRoles } from "@/entities/user/hooks/useUserRoles";
import { Permissions } from "@/libs/permissions/permissions";
import { AgeLevel, Gender, SkillLevel } from "@/entities/team/Team.schema";

type TeamFilter = {
  type: "age" | "gender" | "skill";
  value: AgeLevel | Gender | SkillLevel | "all";
};

export default function TeamsPage({ params }: { params: { domain: string } }) {
  const { data: tenant } = useTenantByDomain(params.domain);
  const { data: teams, error } = useGetTeamsByTenantId(
    tenant?.id.toString() ?? ""
  );
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [teamFilter, setTeamFilter] = useState<TeamFilter>({
    type: "age",
    value: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const userEntity = useUserRoles();
  const canManageTeams = Permissions.Teams.manage(userEntity);

  if (error) return <div>{error.message}</div>;

  const filteredTeams = teams?.filter((team) => {
    const matchesFilter =
      teamFilter.value === "all" ||
      (teamFilter.type === "age" && team.age === teamFilter.value) ||
      (teamFilter.type === "gender" && team.gender === teamFilter.value) ||
      (teamFilter.type === "skill" && team.skill === teamFilter.value);

    const matchesSearch =
      searchQuery === "" ||
      team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${team.gender} ${team.age} ${team.skill}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold tracking-tight">Teams</h3>
        {canManageTeams && (
          <Button
            onClick={() => setIsAddTeamOpen(true)}
            className="gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add Team
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <TeamsTableFilters
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      <div>
        <TeamsTable
          teams={filteredTeams}
          tenantId={tenant?.id.toString() ?? ""}
          canManageTeams={canManageTeams}
        />
      </div>

      <ResponsiveSheet
        isOpen={isAddTeamOpen}
        setIsOpen={setIsAddTeamOpen}
        title="Add Team"
      >
        <AddTeamForm
          tenantId={tenant?.id.toString() ?? ""}
          setIsParentModalOpen={setIsAddTeamOpen}
        />
      </ResponsiveSheet>
    </div>
  );
}
