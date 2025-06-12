"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { Group } from "@/entities/group/Group.schema";
import { getRecommendedMembersForGroup } from "@/entities/group/Group.utils";
import { useAssignMembersToGroup } from "@/entities/group/GroupConnection.actions.client";
import {
  AssignMembersToGroupDiff,
  MemberGroupConnection,
} from "@/entities/group/GroupConnection.schema";
import {
  getAgeFromDateOfBirth,
  getTenantPerformerName,
} from "@/entities/member/Member.utils";
import { usePerformers } from "@/entities/member/Performer.query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Plus, UserMinus, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  memberIds: z.array(z.number()),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  group: Group;
  tenantId: string;
  setIsOpen: (open: boolean) => void;
  existingConnections: MemberGroupConnection[];
}

interface MemberTableProps {
  members: any[];
  selectedIds: number[];
  onToggleMember: (memberId: number) => void;
  onRemoveMember?: (memberId: number) => void;
  title: string;
  emptyMessage: string;
  variant?: "existing" | "available";
}

const MemberTable = ({
  members,
  onToggleMember,
  onRemoveMember,
  title,
  emptyMessage,
  variant = "available",
}: MemberTableProps) => {
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last;
  };

  const isExisting = variant === "existing";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          {isExisting ? (
            <UserMinus className="h-4 w-4 text-blue-600" />
          ) : (
            <Users className="h-4 w-4" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {!isExisting && <TableHead className="w-12"></TableHead>}
                <TableHead>Member</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                {isExisting && <TableHead className="w-12"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const age = member.dateOfBirth
                  ? getAgeFromDateOfBirth(member.dateOfBirth)
                  : null;

                return (
                  <TableRow key={member.id}>
                    {!isExisting && (
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleMember(member.id)}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-600 hover:bg-green-600/10"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary text-xs font-semibold">
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.firstName} {member.lastName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {age ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{age}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {member.gender ? (
                        <Badge variant="outline" className="capitalize">
                          {member.gender.toLowerCase()}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    {isExisting && (
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveMember?.(member.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default function ManageMembersForm({
  group,
  tenantId,
  setIsOpen,
  existingConnections,
}: Props) {
  const { tenant } = useTenantAndUserAccessContext();
  const { data: performers } = usePerformers(tenantId);
  const assignMembers = useAssignMembersToGroup(tenantId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberIds: existingConnections.map((c) => c.memberId),
    },
  });

  // Get existing member IDs in the group
  const existingMemberIds = useMemo(
    () => new Set(existingConnections.map((c) => c.memberId)),
    [existingConnections]
  );

  // Get existing players (currently assigned to the group) - reactive to form changes
  const existingPlayers = useMemo(() => {
    if (!performers) return [];

    const currentMemberIds = new Set(form.watch("memberIds"));

    return performers.filter((performer) => currentMemberIds.has(performer.id));
  }, [performers, form.watch("memberIds")]);

  // Use the utility function to get recommended and other members, excluding existing ones
  const { recommendedMembers, otherMembers } = useMemo(() => {
    if (!performers) return { recommendedMembers: [], otherMembers: [] };

    // Get current form values to exclude selected members as well
    const currentMemberIds = new Set(form.watch("memberIds"));

    // Convert performers to Member format and use the utility function
    const membersAsMembers = performers
      .filter((performer) => !currentMemberIds.has(performer.id)) // Exclude currently selected players
      .map((performer) => ({
        id: performer.id,
        firstName: performer.firstName,
        lastName: performer.lastName,
        dateOfBirth: performer.dateOfBirth,
        gender: performer.gender,
        memberType: performer.memberType,
        tenantUserId: performer.tenantUserId,
        tenantId: performer.tenantId || Number(tenantId), // Handle nullable tenantId
        createdAt: performer.createdAt,
      }));

    const { recommended, others } = getRecommendedMembersForGroup(
      membersAsMembers,
      group
    );

    const sortByFullName = (a: any, b: any) => {
      const fullNameA = `${a.firstName || ""} ${a.lastName || ""}`
        .trim()
        .toLowerCase();
      const fullNameB = `${b.firstName || ""} ${b.lastName || ""}`
        .trim()
        .toLowerCase();
      return fullNameA.localeCompare(fullNameB);
    };

    return {
      recommendedMembers: recommended.sort(sortByFullName),
      otherMembers: others.sort(sortByFullName),
    };
  }, [performers, group, tenantId, form.watch("memberIds")]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // Calculate the diff for the assignment
      const currentMemberIds = new Set(values.memberIds);

      const existingMemberIdsSet = new Set(
        existingConnections.map((c) => c.memberId)
      );

      // Members to add (new selections)
      const toAdd = Array.from(currentMemberIds)
        .filter((id) => !existingMemberIdsSet.has(id))
        .map((memberId) => ({
          memberId,
          isPrimary: false,
          isInstructor: false,
        }));

      // Members to remove (deselected)
      const toRemove = Array.from(existingMemberIdsSet).filter(
        (id) => !currentMemberIds.has(id)
      );

      const changes: AssignMembersToGroupDiff = {
        groupId: group.id,
        tenantId: Number(tenantId),
        toAdd,
        toRemove,
        toUpdate: [], // No updates needed since we removed instructor functionality
      };

      await assignMembers.mutateAsync(changes);

      toast.success("Players assigned successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Error assigning players:", error);
      toast.error("Failed to assign players");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMember = (memberId: number) => {
    const currentIds = form.getValues("memberIds");

    const newIds = currentIds.includes(memberId)
      ? currentIds.filter((id) => id !== memberId)
      : [...currentIds, memberId];

    form.setValue("memberIds", newIds, { shouldDirty: true });
  };

  const removeMember = (memberId: number) => {
    const currentIds = form.getValues("memberIds");
    const newIds = currentIds.filter((id) => id !== memberId);
    form.setValue("memberIds", newIds, { shouldDirty: true });
  };

  const performerDisplayName = tenant
    ? getTenantPerformerName(tenant)
    : "Performers";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {/* Existing Players */}
          <MemberTable
            members={existingPlayers}
            selectedIds={form.watch("memberIds")}
            onToggleMember={toggleMember}
            onRemoveMember={removeMember}
            title={`Current ${performerDisplayName}`}
            emptyMessage={`No ${performerDisplayName.toLowerCase()} currently assigned to this group`}
            variant="existing"
          />

          {/* Recommended Members */}
          <MemberTable
            members={recommendedMembers}
            selectedIds={form.watch("memberIds")}
            onToggleMember={toggleMember}
            title={`Recommended ${performerDisplayName}`}
            emptyMessage={`No recommended ${performerDisplayName.toLowerCase()} found for this group`}
          />

          {/* Other Available Members */}
          <MemberTable
            members={otherMembers}
            selectedIds={form.watch("memberIds")}
            onToggleMember={toggleMember}
            title={`Other Available ${performerDisplayName}`}
            emptyMessage={`No other ${performerDisplayName.toLowerCase()} available`}
          />
        </div>

        <FormButtons
          buttonText="Save Changes"
          isLoading={isSubmitting}
          isDirty={form.formState.isDirty}
          onCancel={() => setIsOpen(false)}
        />
      </form>
    </Form>
  );
}
