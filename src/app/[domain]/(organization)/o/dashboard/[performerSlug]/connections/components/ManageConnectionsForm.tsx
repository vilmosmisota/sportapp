"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getTenantPerformerSingularName,
  isEligibleForUserAccount,
} from "@/entities/member/Member.utils";
import { useUpdateMemberUserId } from "@/entities/member/Performer.actions.client";
import { useUpdatePerformerFamilyConnections } from "@/entities/member/PerformerConnection.actions.client";
import { PerformerWithConnection } from "@/entities/member/PerformerConnection.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Tenant } from "../../../../../../../../entities/tenant/Tenant.schema";
import SelectableParentList from "./SelectableParentList";
import SelectableUserList from "./SelectableUserList";

const ManageConnectionsFormSchema = z.object({
  userId: z.string().optional(),
  parentIds: z.array(z.number()).default([]),
});

type ManageConnectionsFormData = z.infer<typeof ManageConnectionsFormSchema>;

interface ManageConnectionsFormProps {
  performer: PerformerWithConnection;
  tenant: Tenant;
  onClose: () => void;
}

export default function ManageConnectionsForm({
  performer,
  tenant,
  onClose,
}: ManageConnectionsFormProps) {
  const tenantId = tenant.id.toString();
  const [activeTab, setActiveTab] = useState("users");

  const updateConnections = useUpdatePerformerFamilyConnections(tenantId);
  const updateMemberUserId = useUpdateMemberUserId(tenantId);

  const singularPerformerName = getTenantPerformerSingularName(tenant);

  const currentParentIds =
    performer.parentConnections
      ?.map((conn) => conn.parentMember?.id)
      .filter((id): id is number => id !== undefined) || [];

  const form = useForm<ManageConnectionsFormData>({
    resolver: zodResolver(ManageConnectionsFormSchema),
    defaultValues: {
      userId: performer.userId || undefined,
      parentIds: currentParentIds,
    },
  });

  const onSubmit = async (data: ManageConnectionsFormData) => {
    try {
      const promises: Promise<any>[] = [];

      const parentIdsChanged =
        data.parentIds.length !== currentParentIds.length ||
        !data.parentIds.every((id) => currentParentIds.includes(id)) ||
        !currentParentIds.every((id) => data.parentIds.includes(id));

      if (parentIdsChanged) {
        promises.push(
          updateConnections.mutateAsync({
            performerId: performer.id,
            options: {
              parentIds: data.parentIds,
              existingParentIds: currentParentIds,
            },
          })
        );
      }

      const userIdChanged = data.userId !== performer.userId;
      if (userIdChanged) {
        promises.push(
          updateMemberUserId.mutateAsync({
            memberId: performer.id,
            userId: data.userId || null,
          })
        );
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        toast.success("Connections updated successfully");
      } else {
        toast.info("No changes to save");
      }

      onClose();
    } catch (error: any) {
      toast.error(`Error updating connections: ${error.message}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Link user accounts and parent relationships.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">User Account</TabsTrigger>
              <TabsTrigger value="parents">Parents/Guardians</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>User Account</FormLabel>
                    {!isEligibleForUserAccount(performer.dateOfBirth || "") ? (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          This {singularPerformerName.toLowerCase()} must be at
                          least 13 years old to have a user account.
                        </p>
                      </div>
                    ) : (
                      <SelectableUserList
                        tenantId={tenantId}
                        selectedUserId={field.value}
                        onUserSelect={(userId) => field.onChange(userId)}
                        placeholder="Search users..."
                        emptyMessage="No available users found."
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="parents" className="space-y-4">
              <FormField
                control={form.control}
                name="parentIds"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Parents/Guardians</FormLabel>
                    <SelectableParentList
                      tenantId={tenantId}
                      selectedParentIds={field.value}
                      onParentSelect={(parentIds) => field.onChange(parentIds)}
                      excludePerformerId={performer.id}
                      placeholder="Search parents..."
                      emptyMessage="No parents found."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              updateConnections.isPending || updateMemberUserId.isPending
            }
          >
            {updateConnections.isPending || updateMemberUserId.isPending
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
