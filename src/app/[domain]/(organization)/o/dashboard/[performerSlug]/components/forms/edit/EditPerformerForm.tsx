"use client";

import { Form } from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberType } from "@/entities/member/Member.schema";
import { useUpdatePerformer } from "@/entities/member/Performer.actions.client";
import {
  Performer,
  PerformerData,
  PerformerForm,
  PerformerFormSchema,
} from "@/entities/member/Performer.schema";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getTenantPerformerSingularName } from "../../../../../../../../../entities/member/Member.utils";
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
  const [activeTab, setActiveTab] = useState("details");

  const singularDisplayName = getTenantPerformerSingularName(tenant);
  const tenantId = tenant.id.toString();

  // Mutations
  const updatePerformer = useUpdatePerformer(tenantId);

  const form = useForm<PerformerForm>({
    resolver: zodResolver(PerformerFormSchema),
    defaultValues: {
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      dateOfBirth: member.dateOfBirth || "",
      gender: member.gender || undefined,
      memberType: MemberType.Performer,
      userId: member.userId || undefined,
      tenantId: member.tenantId || undefined,
      groupConnections: member.groupConnections || [],
    },
  });

  const { handleSubmit, watch, control } = form;
  const { isDirty, errors } = form.formState;

  const dateOfBirth = watch("dateOfBirth");

  // Combine all mutation loading states
  const isLoading = updatePerformer.isPending;

  // Form is considered dirty if form data changed
  const formIsDirty = isDirty;

  const onSubmit = async (data: PerformerForm) => {
    if (!isDirty) {
      return;
    }

    const performerData = PerformerData.fromFormData(data);

    await updatePerformer.mutateAsync(
      {
        performerId: member.id,
        options: { memberData: performerData.toServiceData() },
      },
      {
        onSuccess: () => {
          toast.success(`${singularDisplayName} updated successfully`);
          setIsParentModalOpen(false);
        },
        onError: (error) => {
          toast.error(
            `Error updating ${singularDisplayName}: ${error.message}`
          );
        },
      }
    );
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
                singularDisplayName={singularDisplayName}
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
