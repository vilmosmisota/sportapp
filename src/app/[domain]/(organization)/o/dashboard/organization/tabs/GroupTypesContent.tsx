"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { useTenantGroupTypes } from "@/entities/tenant/hooks/useGroupTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddGroupTypeForm from "../forms/AddGroupTypeForm";
import { useUserRoles } from "@/entities/user/hooks/useUserRoles";
import { Permissions } from "@/libs/permissions/permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getDisplayAgeGroup } from "@/entities/team/Team.schema";

interface GroupTypesContentProps {
  tenant: Tenant | undefined;
  domain: string;
}

// Helper function to parse age group string
const parseAgeGroup = (group: string) => {
  const [name, range] = group.split("#");
  if (range) {
    const [min, max] = range.split("-").map(Number);
    return { name, min, max };
  }
  return { name: group, min: 0, max: parseInt(group.replace(/\D/g, "")) || 0 };
};

export default function GroupTypesContent({
  tenant,
  domain,
}: GroupTypesContentProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { ageGroups, skillLevels, positions } = useTenantGroupTypes(domain);
  const userEntity = useUserRoles();
  const canManage = Permissions.Organization.manage(userEntity);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Manage your organization&apos;s age groups, skill levels, and player
            positions for teams.
          </h3>
        </div>
        {canManage && (
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Manage Group Types
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="bg-secondary/50 rounded-t-lg">
            <CardTitle className="text-base font-semibold">
              Age Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {ageGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No age groups defined
                </p>
              ) : (
                ageGroups.map((group) => (
                  <Badge key={group} variant="secondary">
                    {getDisplayAgeGroup(group)}
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-secondary/50 rounded-t-lg">
            <CardTitle className="text-base font-semibold">
              Skill Levels
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {skillLevels.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No skill levels defined
                </p>
              ) : (
                skillLevels.map((level) => (
                  <Badge key={level} variant="secondary" className="capitalize">
                    {level}
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-secondary/50 rounded-t-lg">
            <CardTitle className="text-base font-semibold">
              Player Positions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {positions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No positions defined
                </p>
              ) : (
                positions.map((position) => (
                  <Badge
                    key={position}
                    variant="secondary"
                    className="capitalize"
                  >
                    {position}
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ResponsiveSheet
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        title="Add Group Types"
      >
        <AddGroupTypeForm
          tenant={tenant}
          domain={domain}
          setIsParentModalOpen={setIsAddOpen}
        />
      </ResponsiveSheet>
    </div>
  );
}
