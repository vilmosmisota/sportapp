"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Users, Award, Layers } from "lucide-react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AddGroupTypeForm from "../forms/AddGroupTypeForm";

import { getDisplayAgeGroup } from "@/entities/team/Team.schema";

interface GroupTypesContentProps {
  tenant?: Tenant;
}

export default function GroupTypesContent({ tenant }: GroupTypesContentProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Get group types directly from tenant
  const ageGroups = tenant?.groupTypes?.ageGroups || [];
  const skillLevels = tenant?.groupTypes?.skillLevels || [];

  // Check if team management configuration is complete
  const isConfigComplete = ageGroups.length > 0 && skillLevels.length > 0;

  return (
    <div className="space-y-8">
      {!isConfigComplete && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">
            Team Management Configuration Required
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            Please configure age groups and skill levels to enable team
            management features. This is required before you can create teams,
            add players, or manage seasons.
          </AlertDescription>
        </Alert>
      )}

      {/* Section Introduction */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Team Group Management</h2>
        <p className="text-sm text-muted-foreground">
          Configure team grouping settings for your organization
        </p>
      </div>

      {/* Group Types Management Card */}
      <Card className="border">
        <CardHeader className="bg-secondary/30 py-2 px-6 border-b flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Layers className="h-4 w-4" />
            Group Types
          </CardTitle>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Manage Groups
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Manage your organization&apos;s age groups and skill levels for
                teams
              </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Age Groups Card */}
              <Card
                className={`border ${
                  ageGroups.length === 0 ? "border-amber-300" : ""
                }`}
              >
                <CardHeader
                  className={`py-2 px-4 ${
                    ageGroups.length === 0
                      ? "bg-amber-50/50"
                      : "bg-secondary/20"
                  } border-b`}
                >
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4" />
                    Age Groups
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
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

              {/* Skill Levels Card */}
              <Card
                className={`border ${
                  skillLevels.length === 0 ? "border-amber-300" : ""
                }`}
              >
                <CardHeader
                  className={`py-2 px-4 ${
                    skillLevels.length === 0
                      ? "bg-amber-50/50"
                      : "bg-secondary/20"
                  } border-b`}
                >
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Award className="h-4 w-4" />
                    Skill Levels
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {skillLevels.length === 0 ? (
                      <p className="text-sm text-amber-600 font-medium">
                        No skill levels defined - Required
                      </p>
                    ) : (
                      skillLevels.map((level) => (
                        <Badge
                          key={level}
                          variant="secondary"
                          className="capitalize"
                        >
                          {level}
                        </Badge>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <ResponsiveSheet
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        title="Add Group Types"
      >
        <AddGroupTypeForm tenant={tenant} setIsParentModalOpen={setIsAddOpen} />
      </ResponsiveSheet>
    </div>
  );
}
