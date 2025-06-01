"use client";

import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { usePerformers } from "@/entities/member/Member.query";
import { MemberWithRelations } from "@/entities/member/Member.schema";
import {
  getMemberDisplayName,
  getMemberSingularDisplayName,
  getMemberSlug,
} from "@/entities/member/Member.utils";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useTenantAndUserAccessContext } from "../../../../../../components/auth/TenantAndUserAccessContext";
import MembersTable from "./components/MembersTable";
import AddPerformerForm from "./forms/add/AddPerformerForm";

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
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
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

  const displayName = getMemberDisplayName(tenant);
  const configSlug = getMemberSlug(tenant);
  const singularDisplayName = getMemberSingularDisplayName(tenant);

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

  // Convert members to MemberWithRelations type (they should already have the relations from the query)
  const membersWithRelations = (members || []) as MemberWithRelations[];

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

        {membersWithRelations && (
          <MembersTable
            members={membersWithRelations}
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
