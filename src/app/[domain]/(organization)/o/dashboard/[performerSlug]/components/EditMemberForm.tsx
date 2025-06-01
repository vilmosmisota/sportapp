"use client";

import { MemberWithRelations } from "@/entities/member/Member.schema";
import { useTenantAndUserAccessContext } from "../../../../../../../components/auth/TenantAndUserAccessContext";
import EditPerformerForm from "../forms/edit/EditPerformerForm";

interface EditMemberFormProps {
  member: MemberWithRelations;
  tenantId: string;
  domain: string;
  setIsParentModalOpen: (open: boolean) => void;
  displayName: string;
}

export default function EditMemberForm({
  member,
  tenantId,
  domain,
  setIsParentModalOpen,
  displayName,
}: EditMemberFormProps) {
  const { tenant } = useTenantAndUserAccessContext();

  if (!tenant) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-muted-foreground">
            Loading...
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Loading tenant information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <EditPerformerForm
      member={member}
      tenant={tenant}
      setIsParentModalOpen={setIsParentModalOpen}
    />
  );
}
