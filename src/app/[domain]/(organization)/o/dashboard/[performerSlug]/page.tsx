"use client";

import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import {
  getTenantPerformerName,
  getTenantPerformerSingularName,
  getTenantPerformerSlug,
} from "@/entities/member/Member.utils";
import { usePerformers } from "@/entities/member/Performer.query";
import { Performer } from "@/entities/member/Performer.schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ResponsiveSheet } from "../../../../../../components/ui/responsive-sheet";
import { useTenantAndUserAccessContext } from "../../../../../../composites/auth/TenantAndUserAccessContext";
import AddPerformerForm from "./components/forms/add/AddPerformerForm";
import MembersTable from "./components/MembersTable";
import PerformerPageLoader from "./components/PerformerPageLoader";

export default function DynamicMembersPage({
  params,
}: {
  params: { domain: string; performerSlug: string };
}) {
  const { tenant } = useTenantAndUserAccessContext();
  const tenantId = tenant?.id?.toString() || "";
  const { data: members, error, isLoading } = usePerformers(tenantId);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  if (isLoading) {
    return <PerformerPageLoader />;
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

  const displayName = getTenantPerformerName(tenant);
  const configSlug = getTenantPerformerSlug(tenant);
  const singularDisplayName = getTenantPerformerSingularName(tenant);

  const isValidSlug = params.performerSlug === configSlug;

  if (!isValidSlug) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center space-y-2">
        <h3 className="text-lg font-medium">Page not found</h3>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for does not exist.
        </p>
      </div>
    );
  }

  const performers = (members || []) as Performer[];

  return (
    <ErrorBoundary>
      <div className="w-full space-y-6">
        <PageHeader
          title={displayName}
          description={`Manage your organization's ${displayName.toLowerCase()} and their teams.`}
          actions={
            <Button onClick={() => setIsAddMemberOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add {singularDisplayName}
            </Button>
          }
        />

        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error.message}
          </div>
        )}

        {performers && (
          <MembersTable
            members={performers}
            tenantId={tenantId}
            domain={params.domain}
            displayName={displayName}
          />
        )}

        <ResponsiveSheet
          isOpen={isAddMemberOpen}
          setIsOpen={setIsAddMemberOpen}
          title={`Add ${singularDisplayName}`}
        >
          <AddPerformerForm
            tenantId={tenantId}
            domain={params.domain}
            displayName={displayName}
            singularDisplayName={singularDisplayName}
            setIsParentModalOpen={setIsAddMemberOpen}
          />
        </ResponsiveSheet>
      </div>
    </ErrorBoundary>
  );
}
