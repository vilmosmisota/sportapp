"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { useManagementDashboard } from "@/entities/db-views/ManagementDashboard.query";
import { Shield, ShieldUser, UserCheck } from "lucide-react";
import { PageHeader } from "../../../components/ui/page-header";
import { getTenantPerformerName } from "../../../entities/member/Member.utils";
import { ManagementDashboardSkeleton } from "./loading";

export default function ManagementDashboard({
  params,
}: {
  params: { domain: string };
}) {
  const { tenant } = useTenantAndUserAccessContext();

  const { data: dashboardData, isLoading: isDashboardLoading } =
    useManagementDashboard(tenant?.id?.toString() || "");

  if (isDashboardLoading || !tenant) {
    return <ManagementDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Management Dashboard"
        description="This dashboard provides a quick overview of your members, groups, and instructors."
      />
      {/* Management Dashboard Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total {getTenantPerformerName(tenant)}
            </CardTitle>
            <ShieldUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.totalPerformers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {`${dashboardData?.malePerformers || 0} male, ${
                dashboardData?.femalePerformers || 0
              } female`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.totalGroups || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Instructors
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.totalInstructors || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active instructors</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
