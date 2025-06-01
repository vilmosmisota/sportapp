"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberType } from "@/entities/member/Member.schema";
import { useAddPerformer } from "@/entities/member/Performer.actions.client";
import {
  PerformerData,
  PerformerForm,
  PerformerFormSchema,
} from "@/entities/member/Performer.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, User, UsersRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
  const [formKey, setFormKey] = useState(0);

  const addPerformer = useAddPerformer(tenantId);

  const form = useForm<PerformerForm>({
    resolver: zodResolver(PerformerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: undefined,
      memberType: MemberType.Performer,
      userId: undefined,
      tenantId: undefined,
      groupConnections: [],
    },
  });

  const { handleSubmit, watch } = form;
  const { isDirty } = form.formState;

  const dateOfBirth = watch("dateOfBirth");

  const resetFormCompletely = () => {
    form.reset({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: undefined,
      memberType: MemberType.Performer,
      userId: undefined,
      tenantId: undefined,
      groupConnections: [],
    });
    setFormKey((prev) => prev + 1);
  };

  const onSubmit = async (data: PerformerForm) => {
    const performerData = PerformerData.fromFormData(data);

    await addPerformer.mutateAsync(
      {
        memberData: performerData.toServiceData(),
      },
      {
        onSuccess: () => {
          resetFormCompletely();
          setIsParentModalOpen?.(false);
          toast.success(`${singularDisplayName} added successfully`);
        },
        onError: (error) => {
          toast.error(`Error adding ${singularDisplayName}: ${error.message}`);
        },
      }
    );
  };

  const onSubmitAndAddAnother = async (data: PerformerForm) => {
    const performerData = PerformerData.fromFormData(data);

    await addPerformer.mutateAsync(
      {
        memberData: performerData.toServiceData(),
      },
      {
        onSuccess: () => {
          resetFormCompletely();
          toast.success(`${singularDisplayName} added successfully`);
        },
        onError: (error) => {
          toast.error(`Error adding ${singularDisplayName}: ${error.message}`);
        },
      }
    );
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
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <UsersRound className="h-4 w-4" />
                    Group Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <UsersRound className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">
                      Group Assignment
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Group assignment functionality will be implemented here.
                    </p>
                  </div>
                </CardContent>
              </Card>
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
