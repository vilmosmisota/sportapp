"use client";

import { PageHeader } from "@/components/ui/page-header";
import {
  getTenantPerformerName,
  getTenantPerformerSingularName,
} from "@/entities/member/Member.utils";
import { useTenantAndUserAccessContext } from "../../../../../../../components/auth/TenantAndUserAccessContext";

export default function VerificationsPage() {
  const { tenant } = useTenantAndUserAccessContext();

  if (!tenant) {
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
  const singularDisplayName = getTenantPerformerSingularName(tenant);

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title={`${singularDisplayName} Verifications`}
        description={`Manage verification status and documents for ${displayName.toLowerCase()}.`}
      />

      <div className="rounded-lg border p-8 text-center">
        <h3 className="text-lg font-medium mb-2">Verifications Coming Soon</h3>
        <p className="text-sm text-muted-foreground">
          This feature is currently under development and will be available
          soon.
        </p>
      </div>
    </div>
  );
}
