import { TypedClient } from "@/libs/supabase/type";
import { MemberType } from "../member/Member.schema";
import {
  AssignMembersToGroupDiff,
  GroupConnection,
  GroupConnectionSchema,
  GroupMemberAssignmentResult,
  GroupMemberAssignmentResultSchema,
  GroupMembersByType,
  MemberGroupConnection,
} from "./GroupConnection.schema";

const GROUP_CONNECTION_QUERY = `
  *,
  memberConnections:memberGroupConnections(
    id,
    groupId,
    memberId,
    tenantId,
    isPrimary,
    isInstructor,
    member:members(
      id,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      memberType,
      tenantUserId,
      pin
    )
  )
`;

/**
 * Get detailed group information including all member connections organized by member type
 */
export const getGroupConnections = async (
  client: TypedClient,
  groupId: number,
  tenantId: string
): Promise<GroupConnection> => {
  const { data, error } = await client
    .from("groups")
    .select(GROUP_CONNECTION_QUERY)
    .eq("id", groupId)
    .eq("tenantId", Number(tenantId))
    .single();

  if (error) throw error;
  if (!data) throw new Error("Group not found");

  // Organize member connections by type - performers and management, then split by instructor status
  const memberConnections: GroupMembersByType = {
    performers: [],
    instructors: [],
  };

  // Group connections by member type - filter for performers and management
  if (data.memberConnections) {
    data.memberConnections.forEach((connection: any) => {
      if (
        connection.member &&
        (connection.member.memberType === MemberType.Performer ||
          connection.member.memberType === MemberType.Manager)
      ) {
        const connectionDetail: MemberGroupConnection = {
          id: connection.id,
          groupId: connection.groupId,
          memberId: connection.memberId,
          tenantId: connection.tenantId,
          isPrimary: connection.isPrimary,
          isInstructor: connection.isInstructor,
          member: {
            id: connection.member.id,
            firstName: connection.member.firstName,
            lastName: connection.member.lastName,
            dateOfBirth: connection.member.dateOfBirth,
            gender: connection.member.gender,
            memberType: connection.member.memberType,
            tenantUserId: connection.member.tenantUserId,
            pin: connection.member.pin,
          },
        };

        // Categorize by instructor status
        if (connection.isInstructor) {
          memberConnections.instructors.push(connectionDetail);
        } else {
          memberConnections.performers.push(connectionDetail);
        }
      }
    });
  }

  const groupDetails = {
    group: {
      id: data.id,
      ageRange: data.ageRange,
      level: data.level,
      gender: data.gender,
      tenantId: data.tenantId,
      customName: data.customName,
      appearance: data.appearance,
    },
    memberConnections,
  };

  return GroupConnectionSchema.parse(groupDetails);
};

/**
 * Assign members to a group using smart diff approach
 * Frontend calculates the changes and sends only what needs to be modified
 * This is much more efficient than delete-all + insert-all approach
 */
export const assignMembersToGroup = async (
  client: TypedClient,
  changes: AssignMembersToGroupDiff
): Promise<GroupMemberAssignmentResult> => {
  const { groupId, tenantId, toAdd, toRemove, toUpdate } = changes;

  try {
    let addedCount = 0;
    let removedCount = 0;
    let updatedCount = 0;

    // 1. Remove connections that are no longer needed
    if (toRemove.length > 0) {
      const { error: deleteError } = await client
        .from("memberGroupConnections")
        .delete()
        .eq("groupId", groupId)
        .eq("tenantId", tenantId)
        .in("memberId", toRemove);

      if (deleteError) throw deleteError;
      removedCount = toRemove.length;
    }

    // 2. Add new connections
    if (toAdd.length > 0) {
      const connectionsToInsert = toAdd.map((assignment) => ({
        groupId,
        memberId: assignment.memberId,
        tenantId,
        isPrimary: assignment.isPrimary,
        isInstructor: assignment.isInstructor,
      }));

      const { error: insertError } = await client
        .from("memberGroupConnections")
        .insert(connectionsToInsert);

      if (insertError) throw insertError;
      addedCount = toAdd.length;
    }

    // 3. Update existing connections
    if (toUpdate.length > 0) {
      const updatePromises = toUpdate.map(async (update) => {
        const { error: updateError } = await client
          .from("memberGroupConnections")
          .update({
            isPrimary: update.isPrimary,
            isInstructor: update.isInstructor,
          })
          .eq("id", update.connectionId);

        if (updateError) throw updateError;
      });

      await Promise.all(updatePromises);
      updatedCount = toUpdate.length;
    }

    const result = {
      success: true,
      added: addedCount,
      removed: removedCount,
      updated: updatedCount,
    };

    return GroupMemberAssignmentResultSchema.parse(result);
  } catch (error) {
    console.error("Error in assignMembersToGroup:", error);
    throw error;
  }
};
