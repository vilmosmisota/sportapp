import { TypedClient } from "@/libs/supabase/type";
import {
  PerformersWithConnection,
  PerformersWithConnectionSchema,
} from "./PerformerConnection.schema";

const PERFORMER_WITH_CONNECTION_QUERY = `
  id,
  firstName,
  lastName,
  dateOfBirth,
  tenantUser:tenantUsers!memberId(
    status,
    user:users(
      id,
      email
    )
  ),
  parentConnections:familyMemberConnections!performerId(
    id,
    createdAt,
    parentId,
    performerId,
    relationship,
    parentMember:members!parentId(
      id,
      firstName,
      lastName
    )
  )
`;

export const getPerformersWithConnections = async (
  client: TypedClient,
  tenantId: string
): Promise<PerformersWithConnection> => {
  const { data, error } = await client
    .from("members")
    .select(PERFORMER_WITH_CONNECTION_QUERY)
    .eq("tenantId", Number(tenantId))
    .eq("memberType", "performer");

  if (error) throw error;

  return PerformersWithConnectionSchema.parse(data);
};

export interface UpdatePerformerFamilyConnectionsOptions {
  parentIds: number[];
  existingParentIds: number[];
}

/**
 * Update performer family connections by assigning/removing existing parent members
 * Only works with existing users and parent members - does not create new ones
 */
export const updatePerformerFamilyConnections = async (
  client: TypedClient,
  performerId: number,
  options: UpdatePerformerFamilyConnectionsOptions
): Promise<number> => {
  const { parentIds, existingParentIds } = options;

  try {
    const parentIdsToRemove = existingParentIds.filter(
      (id) => !parentIds.includes(id)
    );
    const parentIdsToAdd = parentIds.filter(
      (id) => !existingParentIds.includes(id)
    );

    if (parentIdsToRemove.length > 0) {
      const { error: deleteError } = await client
        .from("familyMemberConnections")
        .delete()
        .eq("performerId", performerId)
        .in("parentId", parentIdsToRemove);

      if (deleteError) throw deleteError;
    }

    if (parentIdsToAdd.length > 0) {
      const connectionsToInsert = parentIdsToAdd.map((parentId) => ({
        performerId,
        parentId,
      }));

      const { error: insertError } = await client
        .from("familyMemberConnections")
        .insert(connectionsToInsert);

      if (insertError) throw insertError;
    }

    return performerId;
  } catch (error) {
    console.error("Error in updatePerformerFamilyConnections:", error);
    console.error("Error in updatePerformerConnections:", error);
    throw error;
  }
};
