"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { useGroups } from "@/entities/group/Group.query";
import { useAddPerformer } from "@/entities/member/Performer.actions.client";
import { PerformerData } from "@/entities/member/Performer.data";
import {
  PerformerForm,
  PerformerFormSchema,
} from "@/entities/member/Performer.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, User, UsersRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import GroupAssignmentTab from "./GroupAssignmentTab";
import PerformerDetailsTab from "./PerformerDetailsTab";

type AddPerformerFormProps = {
  tenantId: string;
  domain: string;
  displayName: string;
  singularDisplayName: string;
  setIsParentModalOpen?: (value: boolean) => void;
};

export default function AddPerformerForm({
  tenantId,
  domain,
  displayName,
  singularDisplayName,
  setIsParentModalOpen,
}: AddPerformerFormProps) {
  const { tenant } = useTenantAndUserAccessContext();
  const { data: groups, isLoading: groupsLoading } = useGroups(tenantId);
  const [formKey, setFormKey] = useState(0);

  const addPerformer = useAddPerformer(tenantId);

  const form = useForm<PerformerForm>({
    resolver: zodResolver(PerformerFormSchema),
    defaultValues: PerformerData.createDefaultFormValues(Number(tenantId)),
  });

  const { handleSubmit, watch } = form;
  const { isDirty } = form.formState;

  const dateOfBirth = watch("dateOfBirth");

  const resetFormCompletely = () => {
    form.reset(PerformerData.createDefaultFormValues(Number(tenantId)));
    setFormKey((prev) => prev + 1);
  };

  const onSubmit = async (data: PerformerForm) => {
    const performerData = PerformerData.fromFormData(data);

    try {
      await addPerformer.mutateAsync({
        memberData: performerData.toServiceData(),
      });

      resetFormCompletely();
      setIsParentModalOpen?.(false);
      toast.success(`${singularDisplayName} added successfully`);
    } catch (error: any) {
      toast.error(`Error adding ${singularDisplayName}: ${error.message}`);
    }
  };

  const onSubmitAndAddAnother = async (data: PerformerForm) => {
    const performerData = PerformerData.fromFormData(data);

    try {
      await addPerformer.mutateAsync({
        memberData: performerData.toServiceData(),
      });

      resetFormCompletely();
      toast.success(`${singularDisplayName} added successfully`);
    } catch (error: any) {
      toast.error(`Error adding ${singularDisplayName}: ${error.message}`);
    }
  };

  const onCancel = () => {
    form.reset();
    setIsParentModalOpen?.(false);
  };

  return (
    <Form {...form}>
      <form
        key={formKey}
        className="flex flex-col gap-6 relative"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          <Tabs defaultValue="details">
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
                <UsersRound className="h-4 w-4" />
                <span className="hidden sm:inline">Group Assignment</span>
                <span className="sm:hidden">Groups</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              <PerformerDetailsTab
                control={form.control}
                dateOfBirth={dateOfBirth}
                singularDisplayName={singularDisplayName}
                errors={form.formState.errors}
              />
            </TabsContent>

            <TabsContent value="groups" className="space-y-6 mt-6">
              <GroupAssignmentTab
                control={form.control}
                groups={groups || []}
                isGroupsLoading={groupsLoading}
                tenant={tenant}
                singularDisplayName={singularDisplayName}
                errors={form.formState.errors}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            onClick={handleSubmit(onSubmitAndAddAnother)}
            disabled={!isDirty || addPerformer.isPending}
            variant="outline"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Another
          </Button>
          <FormButtons
            buttonText="Add and Close"
            isLoading={addPerformer.isPending}
            isDirty={isDirty}
            onCancel={onCancel}
          />
        </div>
      </form>
    </Form>
  );
}
