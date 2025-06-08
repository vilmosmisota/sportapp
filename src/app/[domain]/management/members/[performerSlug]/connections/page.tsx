"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import {
  getTenantPerformerName,
  getTenantPerformerSingularName,
  getTenantPerformerSlug,
} from "@/entities/member/Member.utils";
import { usePerformersWithConnections } from "@/entities/member/PerformerConnection.query";
import PerformerPageLoader from "../components/PerformerPageLoader";
import ConnectionsTable from "./components/ConnectionsTable";

export default function ConnectionsPage({
  params,
}: {
  params: { domain: string; performerSlug: string };
}) {
  const { tenant } = useTenantAndUserAccessContext();
  const tenantId = tenant?.id?.toString() || "";
  const {
    data: performersWithConnections,
    error,
    isLoading,
  } = usePerformersWithConnections(tenantId);

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

  return (
    <ErrorBoundary>
      <div className="w-full space-y-6">
        <PageHeader
          title={`${singularDisplayName} Connections`}
          description={`Manage relationships and connections between ${displayName.toLowerCase()}.`}
        />

        {/* TODO Section */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center">
                <span className="text-xs font-medium text-amber-800">!</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800 mb-1">
                TODO: User Invitation System
              </h3>
              <p className="text-sm text-amber-700">
                Need to handle tenantUser status and work out a way to send out
                invitations for users to set up user - tenantUser table and
                connect with members.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error.message}
          </div>
        )}

        {performersWithConnections && (
          <ConnectionsTable
            performers={performersWithConnections}
            tenant={tenant}
            domain={params.domain}
            displayName={displayName}
          />
        )}

        {performersWithConnections &&
          performersWithConnections.length === 0 && (
            <div className="rounded-lg border p-8 text-center">
              <h3 className="text-lg font-medium mb-2">
                No {displayName} Found
              </h3>
              <p className="text-sm text-muted-foreground">
                There are no {displayName.toLowerCase()} in your organization
                yet.
              </p>
            </div>
          )}
      </div>
    </ErrorBoundary>
  );
}
