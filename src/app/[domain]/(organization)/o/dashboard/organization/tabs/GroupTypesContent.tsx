"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AddGroupTypeForm from "../forms/AddGroupTypeForm";

import { getDisplayAgeGroup } from "@/entities/team/Team.schema";

interface GroupTypesContentProps {
  tenant: Tenant | undefined;
  domain: string;
}

export default function GroupTypesContent({
  tenant,
  domain,
}: GroupTypesContentProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Get group types directly from tenant
  const ageGroups = tenant?.groupTypes?.ageGroups || [];
  const skillLevels = tenant?.groupTypes?.skillLevels || [];
  const positions = tenant?.groupTypes?.positions || [];

  // Check if team management configuration is complete
  const isConfigComplete =
    ageGroups.length > 0 && skillLevels.length > 0 && positions.length > 0;

  return (
    <div className="space-y-6">
      {!isConfigComplete && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">
            Team Management Configuration Required
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            Please configure age groups, skill levels, and player positions to
            enable team management features. This is required before you can
            create teams, add players, or manage seasons.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Manage your organization&apos;s age groups, skill levels, and player
            positions for teams.
          </h3>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Manage Group Types
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className={ageGroups.length === 0 ? "border-amber-300" : ""}>
          <CardHeader
            className={`${
              ageGroups.length === 0 ? "bg-amber-50/50" : "bg-secondary/50"
            } rounded-t-lg`}
          >
            <CardTitle className="text-base font-semibold">
              Age Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {ageGroups.length === 0 ? (
                <p className="text-sm text-amber-600 font-medium">
                  No age groups defined - Required
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

        <Card className={skillLevels.length === 0 ? "border-amber-300" : ""}>
          <CardHeader
            className={`${
              skillLevels.length === 0 ? "bg-amber-50/50" : "bg-secondary/50"
            } rounded-t-lg`}
          >
            <CardTitle className="text-base font-semibold">
              Skill Levels
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {skillLevels.length === 0 ? (
                <p className="text-sm text-amber-600 font-medium">
                  No skill levels defined - Required
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

        <Card className={positions.length === 0 ? "border-amber-300" : ""}>
          <CardHeader
            className={`${
              positions.length === 0 ? "bg-amber-50/50" : "bg-secondary/50"
            } rounded-t-lg`}
          >
            <CardTitle className="text-base font-semibold">
              Player Positions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {positions.length === 0 ? (
                <p className="text-sm text-amber-600 font-medium">
                  No positions defined - Required
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
