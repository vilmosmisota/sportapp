"use client";

import { Form } from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGroups } from "@/entities/group/Group.query";
import { getTenantPerformerSingularName } from "@/entities/member/Member.utils";
import { useUpdatePerformer } from "@/entities/member/Performer.actions.client";
import { PerformerData } from "@/entities/member/Performer.data";
import {
  Performer,
  PerformerForm,
  PerformerFormSchema,
} from "@/entities/member/Performer.schema";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import EditGroupAssignmentTab from "./EditGroupAssignmentTab";
import EditPerformerDetailsTab from "./EditPerformerDetailsTab";

interface EditPerformerFormProps {
  member: Performer;
  tenant: Tenant;
  setIsParentModalOpen: (open: boolean) => void;
}

export default function EditPerformerForm({
  member,
  tenant,
  setIsParentModalOpen,
}: EditPerformerFormProps) {
  const { data: groups, isLoading: groupsLoading } = useGroups(
    tenant.id.toString()
  );
  const [activeTab, setActiveTab] = useState("details");

  const singularDisplayName = getTenantPerformerSingularName(tenant);
  const tenantId = tenant.id.toString();

  const updatePerformer = useUpdatePerformer(tenantId);

  const form = useForm<PerformerForm>({
    resolver: zodResolver(PerformerFormSchema),
    defaultValues: PerformerData.createFormValuesFromPerformer(
      member,
      tenant.id
    ),
  });

  const { handleSubmit, watch, control } = form;
  const { isDirty, errors } = form.formState;

  const dateOfBirth = watch("dateOfBirth");

  const isLoading = updatePerformer.isPending;

  const formIsDirty = isDirty;

  const onSubmit = async (data: PerformerForm) => {
    if (!isDirty) {
      return;
    }

    const performerData = PerformerData.fromFormData(data);

    try {
      await updatePerformer.mutateAsync({
        performerId: member.id,
        options: { memberData: performerData.toServiceData() },
      });

      toast.success(`${singularDisplayName} updated successfully`);
      setIsParentModalOpen(false);
    } catch (error: any) {
      toast.error(`Error updating ${singularDisplayName}: ${error.message}`);
    }
  };

  const onCancel = () => {
    form.reset();
    setIsParentModalOpen(false);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 relative"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="h-9 items-center justify-start rounded-lg bg-primary/5 p-1 text-muted-foreground">
              <TabsTrigger
                value="details"
                className="flex items-center gap-2 flex-shrink-0"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {singularDisplayName} Details
                </span>
                <span className="sm:hidden">Details</span>
              </TabsTrigger>
              <TabsTrigger
                value="groups"
                className="flex items-center gap-2 flex-shrink-0"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Group Assignment</span>
                <span className="sm:hidden">Groups</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              <EditPerformerDetailsTab
                control={control}
                dateOfBirth={dateOfBirth}
                singularDisplayName={singularDisplayName}
                errors={errors}
                member={member}
              />
            </TabsContent>

            <TabsContent value="groups" className="space-y-6 mt-6">
              <EditGroupAssignmentTab
                control={control}
                groups={groups || []}
                isGroupsLoading={groupsLoading}
                tenant={tenant}
                singularDisplayName={singularDisplayName}
                errors={errors}
                member={member}
              />
            </TabsContent>
          </Tabs>
        </div>

        <FormButtons
          buttonText={`Update ${singularDisplayName}`}
          isLoading={isLoading}
          isDirty={formIsDirty}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}
