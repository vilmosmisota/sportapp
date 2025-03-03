"use client";

import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/libs/tailwind/utils";
import { AlertCircle } from "lucide-react";
import ProfileContent from "./tabs/ProfileContent";
import GroupTypesContent from "./tabs/GroupTypesContent";
import TrainingSettingsContent from "./tabs/TrainingSettingsContent";
import GameSettingsContent from "./tabs/GameSettingsContent";

export default function OrganizationDetailPage({
  params,
}: {
  params: { domain: string };
}) {
  const { data: tenant, isPending, error } = useTenantByDomain(params.domain);

  // Check if team management configuration is complete
  const isTeamManagementConfigComplete = Boolean(
    tenant?.groupTypes &&
      tenant.groupTypes.ageGroups?.length > 0 &&
      tenant.groupTypes.skillLevels?.length > 0 &&
      tenant.groupTypes.positions?.length > 0
  );

  // Check if training locations are configured
  const hasTrainingLocations = Boolean(
    tenant?.trainingLocations && tenant.trainingLocations.length > 0
  );

  // Check if game locations are configured
  const hasGameLocations = Boolean(
    tenant?.gameLocations && tenant.gameLocations.length > 0
  );

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="w-full space-y-4 md:space-y-6">
      <PageHeader
        title="Organisation"
        description="Manage your organization settings and preferences"
      />
      <div className="px-0">
        <Tabs defaultValue="profile" className="w-full">
          <div className="w-[calc(100vw-2rem)] md:w-fit">
            <ScrollArea className="">
              <TabsList className="mb-3 w-full inline-flex h-10 items-center justify-start rounded-md p-1 text-muted-foreground">
                <TabsTrigger value="profile" className="text-sm">
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="group-types"
                  className={cn(
                    "text-sm relative",
                    !isTeamManagementConfigComplete &&
                      "font-medium text-amber-600"
                  )}
                >
                  {!isTeamManagementConfigComplete && (
                    <AlertCircle className="h-3 w-3 absolute -top-1 -right-1 text-amber-600" />
                  )}
                  Team Management
                </TabsTrigger>
                <TabsTrigger
                  value="training-settings"
                  className={cn(
                    "text-sm relative",
                    !hasTrainingLocations && "font-medium text-amber-600"
                  )}
                >
                  {!hasTrainingLocations && (
                    <AlertCircle className="h-3 w-3 absolute -top-1 -right-1 text-amber-600" />
                  )}
                  Training & Development
                </TabsTrigger>
                <TabsTrigger
                  value="game-settings"
                  className={cn(
                    "text-sm relative",
                    !hasGameLocations && "font-medium text-amber-600"
                  )}
                >
                  {!hasGameLocations && (
                    <AlertCircle className="h-3 w-3 absolute -top-1 -right-1 text-amber-600" />
                  )}
                  Competition
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>

          <div className="mt-4 md:px-0">
            <TabsContent value="profile">
              <ProfileContent tenant={tenant} />
            </TabsContent>
            <TabsContent value="group-types">
              <GroupTypesContent tenant={tenant} domain={params.domain} />
            </TabsContent>
            <TabsContent value="training-settings">
              <TrainingSettingsContent tenant={tenant} domain={params.domain} />
            </TabsContent>
            <TabsContent value="game-settings">
              <GameSettingsContent domain={params.domain} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
