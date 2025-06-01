"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAddPerformer } from "@/entities/member/Member.actions.client";
import {
  MemberForm,
  MemberType,
  createMemberFormSchema,
} from "@/entities/member/Member.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, PlusCircle, User, UserPlus, UsersRound } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { getAgeFromDateOfBirth } from "../../../../../../../../entities/member/Member.utils";
import ParentAssignmentTab from "./ParentAssignmentTab";
import PerformerDetailsTab from "./PerformerDetailsTab";
import UserAccountTab from "./UserAccountTab";

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
  const [selectedParents, setSelectedParents] = useState<number[]>([]);
  const [userData, setUserData] = useState<{
    userId?: string;
    connectToUser: boolean;
  }>({
    userId: undefined,
    connectToUser: false,
  });

  const addPerformer = useAddPerformer(tenantId);

  const form = useForm<MemberForm>({
    resolver: zodResolver(createMemberFormSchema()),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: undefined,
      memberType: MemberType.Performer,
      userId: undefined,
      groupIds: [],
      customFieldValues: [],
    },
  });

  const { handleSubmit, watch } = form;
  const { isDirty } = form.formState;

  const dateOfBirth = watch("dateOfBirth");
  const memberAge = getAgeFromDateOfBirth(dateOfBirth);

  const resetFormCompletely = () => {
    form.reset({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: undefined,
      memberType: MemberType.Performer,
      userId: undefined,
      groupIds: [],
      customFieldValues: [],
    });
    setSelectedParents([]);
    setUserData({ userId: undefined, connectToUser: false });
    setFormKey((prev) => prev + 1);
  };

  const onSubmit = async (data: MemberForm) => {
    await addPerformer.mutateAsync({
      memberData: {
        ...data,
        userId: userData.connectToUser ? userData.userId : undefined,
      },
      parentIds: selectedParents.length > 0 ? selectedParents : undefined,
    });

    resetFormCompletely();
    setIsParentModalOpen?.(false);
  };

  const onSubmitAndAddAnother = async (data: MemberForm) => {
    await addPerformer.mutateAsync({
      memberData: {
        ...data,
        userId: userData.connectToUser ? userData.userId : undefined,
      },
      parentIds: selectedParents.length > 0 ? selectedParents : undefined,
    });

    resetFormCompletely();
  };

  const onCancel = () => {
    form.reset();
    setSelectedParents([]);
    setUserData({ userId: undefined, connectToUser: false });
    setIsParentModalOpen?.(false);
  };

  const handleParentToggle = useCallback((parentId: number) => {
    setSelectedParents((prev) =>
      prev.includes(parentId)
        ? prev.filter((id) => id !== parentId)
        : [...prev, parentId]
    );
  }, []);

  const handleUserDataChange = (newUserData: {
    userId?: string;
    connectToUser: boolean;
  }) => {
    setUserData(newUserData);
  };

  return (
    <Form {...form}>
      <form
        key={formKey}
        className="flex flex-col gap-6 relative"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <ScrollArea className="w-full">
              <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-primary/5 p-1 text-muted-foreground w-max min-w-full">
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
                  value="account"
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">User Account</span>
                  <span className="sm:hidden">Account</span>
                  {memberAge !== null && memberAge >= 13 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                      Available
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="groups"
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <UsersRound className="h-4 w-4" />
                  <span className="hidden sm:inline">Group Assignment</span>
                  <span className="sm:hidden">Groups</span>
                </TabsTrigger>
                <TabsTrigger
                  value="parents"
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Parent Assignment</span>
                  <span className="sm:hidden">Parents</span>
                  {memberAge !== null && memberAge < 13 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">
                      Recommended
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </ScrollArea>

            <TabsContent value="details" className="space-y-6 mt-6">
              <PerformerDetailsTab
                control={form.control}
                dateOfBirth={dateOfBirth}
                singularDisplayName={singularDisplayName}
                errors={form.formState.errors}
              />
            </TabsContent>

            <TabsContent value="account" className="space-y-6 mt-6">
              <UserAccountTab
                tenantId={tenantId}
                singularDisplayName={singularDisplayName}
                memberAge={memberAge}
                onUserDataChange={handleUserDataChange}
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

            <TabsContent value="parents" className="space-y-6 mt-6">
              <ParentAssignmentTab
                tenantId={tenantId}
                memberAge={memberAge}
                singularDisplayName={singularDisplayName}
                selectedParents={selectedParents}
                onParentToggle={handleParentToggle}
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
