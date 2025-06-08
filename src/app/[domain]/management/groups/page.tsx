"use client";

import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { useGroups } from "@/entities/group/Group.query";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddGroupForm from "./components/forms/AddGroupForm";
import GroupsPageLoader from "./components/GroupsPageLoader";
import GroupsTable from "./components/GroupsTable";

export default function GroupsPage({ params }: { params: { domain: string } }) {
  const { tenant } = useTenantAndUserAccessContext();
  const tenantId = tenant?.id?.toString() || "";
  const { data: groups, error, isLoading } = useGroups(tenantId);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

  if (isLoading) {
    return <GroupsPageLoader />;
  }

  if (!tenant || !tenantId) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center space-y-2">
        <h3 className="text-lg font-medium">Organization not found</h3>
        <p className="text-sm text-muted-foreground">
          The organization you&apos;re looking for does not exist.
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-full space-y-6">
        <PageHeader
          title="Groups"
          description="Manage your organization's groups and their settings."
          actions={
            <Button onClick={() => setIsAddGroupOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Group
            </Button>
          }
        />

        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error.message}
          </div>
        )}

        {groups && (
          <GroupsTable
            groups={groups}
            tenantId={tenantId}
            domain={params.domain}
            tenantGroupsConfig={tenant.tenantConfigs?.groups || undefined}
          />
        )}

        <ResponsiveSheet
          isOpen={isAddGroupOpen}
          setIsOpen={setIsAddGroupOpen}
          title="Add Group"
        >
          <AddGroupForm
            tenantId={tenantId}
            domain={params.domain}
            setIsParentModalOpen={setIsAddGroupOpen}
          />
        </ResponsiveSheet>
      </div>
    </ErrorBoundary>
  );
}
