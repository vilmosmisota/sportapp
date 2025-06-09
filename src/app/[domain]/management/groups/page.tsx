"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { useGroups } from "@/entities/group/Group.query";
import { AlertTriangle, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AddGroupForm from "./components/forms/AddGroupForm";
import GroupsPageLoader from "./components/GroupsPageLoader";
import GroupsTable from "./components/GroupsTable";

export default function GroupsPage({ params }: { params: { domain: string } }) {
  const { tenant } = useTenantAndUserAccessContext();
  const tenantId = tenant?.id?.toString() || "";
  const { data: groups, error, isLoading } = useGroups(tenantId);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

  // Check if level options are configured
  const levelOptions = tenant?.tenantConfigs?.groups?.levelOptions || [];
  const hasLevelOptions = levelOptions.length > 0;

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

  const AddGroupButton = () => (
    <Button
      onClick={() => setIsAddGroupOpen(true)}
      className="gap-2"
      disabled={!hasLevelOptions}
    >
      <Plus className="h-4 w-4" />
      Add Group
    </Button>
  );

  return (
    <ErrorBoundary>
      <div className="w-full space-y-6">
        <PageHeader
          title="Groups"
          description="Manage your organization's groups and their settings."
          actions={
            <TooltipProvider>
              {hasLevelOptions ? (
                <AddGroupButton />
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <AddGroupButton />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Configure level options in group settings before adding
                      groups
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          }
        />

        {!hasLevelOptions && (
          <Alert className="border-amber-200/50 bg-gradient-to-b from-amber-50/50 to-amber-50/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              No level options configured. Please configure level options in{" "}
              <Link
                href="/management/groups/settings"
                className="underline hover:no-underline font-medium"
              >
                group settings
              </Link>{" "}
              before creating groups.
            </AlertDescription>
          </Alert>
        )}

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
