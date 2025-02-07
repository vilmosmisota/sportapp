"use client";

import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import ProfileContent from "./tabs/ProfileContent";
import MembershipCategoriesContent from "./tabs/MembershipCategoriesContent";
import GroupTypesContent from "./tabs/GroupTypesContent";
import TrainingSettingsContent from "./tabs/TrainingSettingsContent";

export default function OrganizationDetailPage({
  params,
}: {
  params: { domain: string };
}) {
  const { data: tenant, isPending, error } = useTenantByDomain(params.domain);

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
                <TabsTrigger value="memberships" className="text-sm">
                  Memberships
                </TabsTrigger>
                <TabsTrigger value="group-types" className="text-sm">
                  Group Types
                </TabsTrigger>
                <TabsTrigger value="training-settings" className="text-sm">
                  Training Settings
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>

          <div className="mt-4 md:px-0">
            <TabsContent value="profile">
              <ProfileContent tenant={tenant} />
            </TabsContent>
            <TabsContent value="memberships">
              <MembershipCategoriesContent tenantId={tenant?.id} />
            </TabsContent>
            <TabsContent value="group-types">
              <GroupTypesContent tenant={tenant} domain={params.domain} />
            </TabsContent>
            <TabsContent value="training-settings">
              <TrainingSettingsContent tenant={tenant} domain={params.domain} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
