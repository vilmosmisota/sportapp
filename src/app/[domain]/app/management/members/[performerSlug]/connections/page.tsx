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
