"use client";

import { queryKeys } from "@/cacheKeys/cacheKeys";
import { Form } from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAssignPerformerToMultipleParents,
  useRemovePerformerFromParent,
  useUpdateMember,
} from "@/entities/member/Member.actions.client";
import {
  createMemberFormSchema,
  MemberForm,
  MemberType,
  MemberWithRelations,
} from "@/entities/member/Member.schema";
import { getAgeFromDateOfBirth } from "@/entities/member/Member.utils";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { useUpdateUser } from "@/entities/user/User.actions.client";
import { UserDomain } from "@/entities/user/User.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, User, UserPlus, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getMemberSingularDisplayName } from "../../../../../../../../entities/member/Member.utils";
import EditGroupAssignmentTab from "./EditGroupAssignmentTab";
import EditParentAssignmentTab from "./EditParentAssignmentTab";
import EditPerformerDetailsTab from "./EditPerformerDetailsTab";
import EditUserAccountTab from "./EditUserAccountTab";

interface EditPerformerFormProps {
  member: MemberWithRelations;
  tenant: Tenant;
  setIsParentModalOpen: (open: boolean) => void;
}

export default function EditPerformerForm({
  member,
  tenant,
  setIsParentModalOpen,
}: EditPerformerFormProps) {
  const [selectedParents, setSelectedParents] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const [userData, setUserData] = useState<{
    userId?: string;
    connectToUser: boolean;
    disconnectUser: boolean;
  }>({
    userId: undefined,
    connectToUser: false,
    disconnectUser: false,
  });

  const singularDisplayName = getMemberSingularDisplayName(tenant);
  const tenantId = tenant.id.toString();

  // Query client for manual cache invalidation
  const queryClient = useQueryClient();

  // Mutations
  const updateMember = useUpdateMember(member.id, tenantId);
  const updateUser = useUpdateUser(member.users?.id || "", tenantId);
  const assignPerformerToParents =
    useAssignPerformerToMultipleParents(tenantId);
  const removePerformerFromParent = useRemovePerformerFromParent(tenantId);

  const form = useForm<MemberForm>({
    resolver: zodResolver(createMemberFormSchema()),
    defaultValues: {
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      dateOfBirth: member.dateOfBirth || "",
      gender: member.gender || undefined,
      memberType: MemberType.Performer,
      userId: member.users?.id || undefined,
      groupIds: [], // Groups will be handled separately when group assignment is implemented
      customFieldValues: [], // Custom fields will be handled separately when implemented
    },
  });

  const { handleSubmit, watch, control } = form;
  const { isDirty, errors } = form.formState;

  const dateOfBirth = watch("dateOfBirth");
  const memberAge = getAgeFromDateOfBirth(dateOfBirth);

  // Combine all mutation loading states
  const isLoading =
    updateMember.isPending ||
    updateUser.isPending ||
    assignPerformerToParents.isPending ||
    removePerformerFromParent.isPending;

  // Set initial selected parents when data loads
  useEffect(() => {
    if (member.parentConnections && member.parentConnections.length > 0) {
      setSelectedParents(
        member.parentConnections.map((connection) => connection.parentId)
      );
    }
  }, [member.parentConnections]);

  // Check if parent assignments have changed
  const currentParentIds = (member.parentConnections || [])
    .map((connection) => connection.parentId)
    .sort();
  const selectedParentIds = [...selectedParents].sort();
  const parentsChanged =
    JSON.stringify(currentParentIds) !== JSON.stringify(selectedParentIds);

  // Check if user account changes have been made
  const userAccountChanged = userData.connectToUser || userData.disconnectUser;

  // Form is considered dirty if either form data changed, parent assignments changed, or user account changes
  const formIsDirty = isDirty || parentsChanged || userAccountChanged;

  const onSubmit = async (data: MemberForm) => {
    try {
      // Handle user account changes first
      if (userData.disconnectUser && member.users) {
        // Disconnect user account
        const updatedData = { ...data, userId: undefined };
        await updateMember.mutateAsync({ memberData: updatedData });
      } else if (userData.connectToUser && userData.userId) {
        // Connect to new user account
        const updatedData = { ...data, userId: userData.userId };
        await updateMember.mutateAsync({ memberData: updatedData });
      } else if (isDirty) {
        // Only update member data if form fields have changed
        await updateMember.mutateAsync({ memberData: data });
      }

      // Handle user account updates if user exists and account is being managed
      if (member.users && isDirty && !userData.disconnectUser) {
        const userFormData = {
          email: member.users.email || "",
          firstName: data.firstName,
          lastName: data.lastName,
          memberType: MemberType.Performer,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          userDomains: [UserDomain.PERFORMER],
        };

        await updateUser.mutateAsync({ userData: userFormData });
      }

      // Update parent assignments if they have changed
      if (parentsChanged) {
        const currentParentIds = (member.parentConnections || []).map(
          (connection) => connection.parentId
        );
        const parentIdsToAssign = selectedParents.filter(
          (id) => !currentParentIds.includes(id)
        );
        const parentIdsToRemove = currentParentIds.filter(
          (id) => !selectedParents.includes(id)
        );

        // Add new parent connections
        if (parentIdsToAssign.length > 0) {
          await assignPerformerToParents.mutateAsync({
            performerId: member.id,
            parentIds: parentIdsToAssign,
          });
        }

        // Remove parent connections
        if (parentIdsToRemove.length > 0) {
          for (const parentId of parentIdsToRemove) {
            await removePerformerFromParent.mutateAsync({
              parentId,
              performerId: member.id,
            });
          }
        }
      }

      // Manually invalidate member queries to ensure UI updates
      if (parentsChanged || userAccountChanged) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.member.list(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.member.detail(tenantId, member.id.toString()),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.member.byType(tenantId, "performer"),
        });
      }

      toast.success(`${singularDisplayName} updated successfully`);
      setIsParentModalOpen(false);
    } catch (error: any) {
      console.error(
        `Error updating ${singularDisplayName.toLowerCase()}:`,
        error
      );
      toast.error(
        error.message || `Failed to update ${singularDisplayName.toLowerCase()}`
      );
    }
  };

  const onCancel = () => {
    form.reset();
    setSelectedParents(
      (member.parentConnections || []).map((connection) => connection.parentId)
    );
    setUserData({
      userId: undefined,
      connectToUser: false,
      disconnectUser: false,
    });
    setIsParentModalOpen(false);
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
    disconnectUser: boolean;
  }) => {
    setUserData(newUserData);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 relative"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          <Tabs
            defaultValue="details"
            className="w-full"
            onValueChange={setActiveTab}
          >
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
                      {member.users ? "Connected" : "Available"}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="groups"
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <Users className="h-4 w-4" />
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
              <EditPerformerDetailsTab
                control={control}
                dateOfBirth={dateOfBirth}
                singularDisplayName={singularDisplayName}
                errors={errors}
                member={member}
              />
            </TabsContent>

            <TabsContent value="account" className="space-y-6 mt-6">
              <EditUserAccountTab
                tenantId={tenantId}
                singularDisplayName={singularDisplayName}
                memberAge={memberAge}
                member={member}
                onUserDataChange={handleUserDataChange}
              />
            </TabsContent>

            <TabsContent value="groups" className="space-y-6 mt-6">
              <EditGroupAssignmentTab
                singularDisplayName={singularDisplayName}
              />
            </TabsContent>

            <TabsContent value="parents" className="space-y-6 mt-6">
              <EditParentAssignmentTab
                tenantId={tenantId}
                memberAge={memberAge}
                singularDisplayName={singularDisplayName}
                selectedParents={selectedParents}
                onParentToggle={handleParentToggle}
              />
            </TabsContent>
          </Tabs>
        </div>

        <FormButtons
          buttonText="Save Changes"
          isLoading={isLoading}
          isDirty={formIsDirty}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}
