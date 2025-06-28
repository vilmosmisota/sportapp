"use client";

import { PageHeader } from "@/components/ui/page-header";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import {
  getTenantPerformerName,
  getTenantPerformerSingularName,
} from "@/entities/member/Member.utils";

export default function PermissionsPage() {
  const { tenant } = useTenantAndUserAccessContext();

  if (!tenant) {
    return null;
  }

  const displayName = getTenantPerformerName(tenant);
  const singularDisplayName = getTenantPerformerSingularName(tenant);

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title={`${singularDisplayName} Permissions`}
        description={`Manage access permissions and roles for ${displayName.toLowerCase()}.`}
      />

      <div className="rounded-lg border p-8 text-center">
        <h3 className="text-lg font-medium mb-2">Permissions Coming Soon</h3>
        <p className="text-sm text-muted-foreground">
          This feature is currently under development and will be available
          soon.
        </p>
      </div>
    </div>
  );
}
