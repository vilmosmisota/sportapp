"use client";

import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { Performer } from "@/entities/member/Performer.schema";
import EditPerformerForm from "./forms/edit/EditPerformerForm";

interface EditMemberFormProps {
  member: Performer;
  setIsParentModalOpen: (open: boolean) => void;
}

export default function EditMemberForm({
  member,
  setIsParentModalOpen,
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
