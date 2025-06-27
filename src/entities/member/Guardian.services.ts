import { TypedClient } from "@/libs/supabase/type";
import {
  Guardian,
  Guardians,
  GuardiansSchema,
  GuardiansWithConnection,
  GuardiansWithConnectionSchema,
} from "./Guardian.schema";

const GUARDIAN_WITH_CONNECTION_QUERY = `
  id,
  firstName,
  lastName,
  dateOfBirth,
  gender,
  memberType,
  tenantId,
  createdAt,
  performerConnections:familyMemberConnections!parentId(
    id,
    createdAt,
    parentId,
    performerId,
    relationship,
    performerMember:members!performerId(
      id,
      firstName,
      lastName,
      dateOfBirth
    )
  )
`;

/**
 * Get all guardians with their performer connections
 */
export const getGuardiansWithConnections = async (
  client: TypedClient,
  tenantId: string
): Promise<GuardiansWithConnection> => {
  const { data, error } = await client
    .from("members")
    .select(GUARDIAN_WITH_CONNECTION_QUERY)
    .eq("tenantId", Number(tenantId))
    .eq("memberType", "guardian");

  if (error) throw error;

  return GuardiansWithConnectionSchema.parse(data);
};

/**
 * Get all guardians (without connections)
 */
export const getGuardians = async (
  client: TypedClient,
  tenantId: string
): Promise<Guardians> => {
  const { data, error } = await client
    .from("members")
    .select("*")
    .eq("tenantId", Number(tenantId))
    .eq("memberType", "guardian");

  if (error) throw error;

  return GuardiansSchema.parse(data);
};

export interface AddGuardianOptions {
  memberData: Omit<Guardian, "id" | "createdAt">;
}

/**
 * Add a new guardian
 */
export const addGuardian = async (
  client: TypedClient,
  tenantId: string,
  options: AddGuardianOptions
): Promise<boolean> => {
  const { memberData } = options;

  try {
    const processedMemberData = {
      ...memberData,
      tenantId: Number(tenantId),
    };

    const { error: insertError } = await client
      .from("members")
      .insert(processedMemberData)
      .select()
      .single();

    if (insertError) throw insertError;

    return true;
  } catch (error) {
    console.error("Error in addGuardian:", error);
    throw error;
  }
};

export interface UpdateGuardianOptions {
  memberData: Partial<Omit<Guardian, "id" | "createdAt">>;
}

/**
 * Update a guardian
 */
export const updateGuardian = async (
  client: TypedClient,
  guardianId: number,
  tenantId: string,
  options: UpdateGuardianOptions
): Promise<boolean> => {
  const { memberData } = options;

  try {
    const { error: updateError } = await client
      .from("members")
      .update(memberData)
      .eq("id", guardianId)
      .eq("tenantId", Number(tenantId))
      .eq("memberType", "guardian");

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error("Error in updateGuardian:", error);
    throw error;
  }
};

/**
 * Delete a guardian and all their related data
 */
export const deleteGuardian = async (
  client: TypedClient,
  guardianId: number,
  tenantId: string
): Promise<boolean> => {
  try {
    // Delete in order: connections first, then member
    await client
      .from("familyMemberConnections")
      .delete()
      .eq("parentId", guardianId);

    const { error } = await client
      .from("members")
      .delete()
      .eq("id", guardianId)
      .eq("tenantId", Number(tenantId))
      .eq("memberType", "guardian");

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error in deleteGuardian:", error);
    throw error;
  }
};

export interface UpdateGuardianPerformerConnectionsOptions {
  performerIds: number[];
  existingPerformerIds: number[];
}

/**
 * Update guardian performer connections by assigning/removing existing performer members
 */
export const updateGuardianPerformerConnections = async (
  client: TypedClient,
  guardianId: number,
  options: UpdateGuardianPerformerConnectionsOptions
): Promise<number> => {
  const { performerIds, existingPerformerIds } = options;

  try {
    const performerIdsToRemove = existingPerformerIds.filter(
      (id) => !performerIds.includes(id)
    );
    const performerIdsToAdd = performerIds.filter(
      (id) => !existingPerformerIds.includes(id)
    );

    if (performerIdsToRemove.length > 0) {
      const { error: deleteError } = await client
        .from("familyMemberConnections")
        .delete()
        .eq("parentId", guardianId)
        .in("performerId", performerIdsToRemove);

      if (deleteError) throw deleteError;
    }

    if (performerIdsToAdd.length > 0) {
      const connectionsToInsert = performerIdsToAdd.map((performerId) => ({
        parentId: guardianId,
        performerId,
      }));

      const { error: insertError } = await client
        .from("familyMemberConnections")
        .insert(connectionsToInsert);

      if (insertError) throw insertError;
    }

    return guardianId;
  } catch (error) {
    console.error("Error in updateGuardianPerformerConnections:", error);
    throw error;
  }
};
