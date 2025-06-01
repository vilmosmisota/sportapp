import { TypedClient } from "@/libs/supabase/type";
import {
  MemberGroupConnection,
  Performer,
  Performers,
  PerformersSchema,
} from "./Performer.schema";

const PERFORMER_LIST_QUERY = `
  *,
  groupConnections:memberGroupConnections!left(
    *,
    group:groups(
      id,
      ageRange,
      level,
      gender
    )
  )
`;

export const getPerformers = async (
  client: TypedClient,
  tenantId: string
): Promise<Performers> => {
  const { data, error } = await client
    .from("members")
    .select(PERFORMER_LIST_QUERY)
    .eq("tenantId", Number(tenantId))
    .eq("memberType", "performer");

  if (error) throw error;

  const performers = PerformersSchema.parse(data);
  return performers;
};

export interface AddPerformerOptions {
  memberData: Omit<Performer, "id" | "createdAt">;
}

export const addPerformer = async (
  client: TypedClient,
  tenantId: string,
  options: AddPerformerOptions
): Promise<boolean> => {
  const { memberData } = options;

  try {
    const { groupConnections, ...basePerformerData } = memberData;

    const processedMemberData = {
      ...basePerformerData,
      tenantId: Number(tenantId),
    };

    // 1. Create the member
    const { data: newMember, error: insertError } = await client
      .from("members")
      .insert(processedMemberData)
      .select()
      .single();

    if (insertError) throw insertError;

    // 2. Create group connections if provided
    if (groupConnections?.length) {
      const groupConnectionsToInsert = groupConnections.map(
        (connection: MemberGroupConnection) => ({
          memberId: newMember.id,
          groupId: connection.groupId,
          tenantId: Number(tenantId),
        })
      );

      const { error: groupError } = await client
        .from("memberGroupConnections")
        .insert(groupConnectionsToInsert);

      if (groupError) throw groupError;
    }

    return true;
  } catch (error) {
    console.error("Error in addPerformer:", error);
    throw error;
  }
};

export interface UpdatePerformerOptions {
  memberData: Partial<Omit<Performer, "id" | "createdAt">>;
}

/**
 * Update a performer with the same data structure as getPerformers returns
 * Handles member update with groupConnections
 */
export const updatePerformer = async (
  client: TypedClient,
  performerId: number,
  tenantId: string,
  options: UpdatePerformerOptions
): Promise<boolean> => {
  const { memberData } = options;

  try {
    const { groupConnections, ...basePerformerData } = memberData;

    // 1. Update the base member data if provided
    if (Object.keys(basePerformerData).length > 0) {
      const { error: updateError } = await client
        .from("members")
        .update(basePerformerData)
        .eq("id", performerId)
        .eq("tenantId", Number(tenantId))
        .eq("memberType", "performer");

      if (updateError) throw updateError;
    }

    // 2. Update group connections if provided
    if (groupConnections !== undefined) {
      // Get existing group connections
      const { data: existingConnections, error: fetchError } = await client
        .from("memberGroupConnections")
        .select("groupId")
        .eq("memberId", performerId);

      if (fetchError) throw fetchError;

      const existingGroupIds =
        existingConnections?.map((conn) => conn.groupId) || [];
      const newGroupIds = groupConnections.map((conn) => conn.groupId);

      // Find connections to remove and add
      const groupIdsToRemove = existingGroupIds.filter(
        (id) => !newGroupIds.includes(id)
      );
      const groupIdsToAdd = newGroupIds.filter(
        (id) => !existingGroupIds.includes(id)
      );

      // Remove connections that are no longer needed
      if (groupIdsToRemove.length > 0) {
        const { error: deleteError } = await client
          .from("memberGroupConnections")
          .delete()
          .eq("memberId", performerId)
          .in("groupId", groupIdsToRemove);

        if (deleteError) throw deleteError;
      }

      // Add new connections
      if (groupIdsToAdd.length > 0) {
        const connectionsToInsert = groupIdsToAdd.map((groupId) => ({
          memberId: performerId,
          groupId,
          tenantId: Number(tenantId),
        }));

        const { error: insertError } = await client
          .from("memberGroupConnections")
          .insert(connectionsToInsert);

        if (insertError) throw insertError;
      }
    }

    return true;
  } catch (error) {
    console.error("Error in updatePerformer:", error);
    throw error;
  }
};

/**
 * Delete a performer and all their related data
 * Handles cleanup of group connections
 */
export const deletePerformer = async (
  client: TypedClient,
  performerId: number,
  tenantId: string
): Promise<boolean> => {
  try {
    // 1. Delete group connections
    const { error: groupError } = await client
      .from("memberGroupConnections")
      .delete()
      .eq("memberId", performerId);

    if (groupError) throw groupError;

    // 2. Finally, delete the performer record
    const { error: memberError } = await client
      .from("members")
      .delete()
      .eq("id", performerId)
      .eq("tenantId", Number(tenantId))
      .eq("memberType", "performer");

    if (memberError) throw memberError;

    console.log(
      `Successfully deleted performer ${performerId} and all associated data`
    );

    return true;
  } catch (error) {
    console.error("Error in deletePerformer:", error);
    throw error;
  }
};
