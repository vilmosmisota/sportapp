"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTenantAndUserAccessContext } from "../../../../../../../components/auth/TenantAndUserAccessContext";
import { PageHeader } from "../../../../../../../components/ui/page-header";
import GeneralContent from "./tabs/GeneralContent";
import MembersContent from "./tabs/MembersContent";
import TrainingDevelopmentContent from "./tabs/TrainingDevelopmentContent";

export default function OrganizationDetailPage() {
  const { tenant } = useTenantAndUserAccessContext();

  return (
    <div className="w-full">
      <PageHeader
        title="Organization settings"
        description="Configure your organization's profile, team structure, player development programs, and competition settings"
      />
      <div className="px-0">
        <Tabs defaultValue="general" className="w-full">
          <div className="w-[calc(100vw-2rem)] md:w-fit">
            <ScrollArea className="">
              <TabsList className="mb-3 w-full inline-flex h-10 items-center justify-start rounded-md p-1 text-muted-foreground">
                <TabsTrigger value="general" className="text-sm">
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="player-management"
                  className="text-sm relative"
                >
                  Members
                </TabsTrigger>
                <TabsTrigger
                  value="training-settings"
                  className="text-sm relative"
                >
                  Training & Development
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>

          <div className="mt-4 md:px-0">
            <TabsContent value="general">
              <GeneralContent tenant={tenant} />
            </TabsContent>
            <TabsContent value="player-management">
              <MembersContent tenant={tenant} />
            </TabsContent>
            <TabsContent value="training-settings">
              <TrainingDevelopmentContent tenant={tenant} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
