"use client";

import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { Skeleton } from "@/components/ui/skeleton";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileContent from "./tabs/ProfileContent";
import SeasonsContent from "./tabs/SeasonsContent";
import MembershipCategoriesContent from "./tabs/MembershipCategoriesContent";
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
    <div>
      <h3 className="text-lg mb-3">Organisation</h3>
      <div className="">
        <Tabs defaultValue="profile">
          <TabsList className="mb-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="seasons">Seasons</TabsTrigger>
            <TabsTrigger value="memberships">Memberships</TabsTrigger>
          </TabsList>
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
        </Tabs>
      </div>
    </div>
  );
}
