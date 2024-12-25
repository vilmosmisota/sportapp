"use client";

import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileContent from "./tabs/ProfileContent";
import SeasonsContent from "./tabs/SeasonsContent";
import MembershipCategoriesContent from "./tabs/MembershipCategoriesContent";
import GroupTypesContent from "./tabs/GroupTypesContent";
import { CurrencyTypes } from "@/entities/common/Types";

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
      <div className="flex items-center justify-between px-4 md:px-0">
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
          Organisation
        </h3>
      </div>
      <div className="px-0">
        <Tabs defaultValue="profile" className="w-full">
          <div className="w-[calc(100vw-2rem)] md:w-fit">
            <ScrollArea className="">
              <TabsList className="mb-3 w-full inline-flex h-10 items-center justify-start rounded-md p-1 text-muted-foreground">
                <TabsTrigger value="profile" className="text-sm">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="seasons" className="text-sm">
                  Seasons
                </TabsTrigger>
                <TabsTrigger value="memberships" className="text-sm">
                  Memberships
                </TabsTrigger>
                <TabsTrigger value="group-types" className="text-sm">
                  Group Types
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>

          <div className="mt-4 px-4 md:px-0">
            <TabsContent value="profile">
              <ProfileContent tenant={tenant} />
            </TabsContent>
            <TabsContent value="seasons">
              <SeasonsContent
                tenantId={tenant?.id}
                currency={CurrencyTypes.GBP}
              />
            </TabsContent>
            <TabsContent value="memberships">
              <MembershipCategoriesContent tenantId={tenant?.id} />
            </TabsContent>
            <TabsContent value="group-types">
              <GroupTypesContent tenant={tenant} domain={params.domain} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
