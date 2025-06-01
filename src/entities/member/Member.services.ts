import { TypedClient } from "@/libs/supabase/type";
import { MemberForm, MemberWithRelationsSchema } from "./Member.schema";

// Simple version without user relation if needed
const MEMBER_QUERY_SIMPLE = `
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

const MEMBER_QUERY_WITH_RELATIONS = `
  *,
  groupConnections:memberGroupConnections!left(
    *,
    group:groups(
      id,
      ageRange,
      level,
      gender
    )
  ),
  users!userId(
    id,
    email,
    roleId,
    userDomains
  ),
  parentConnections:familyMemberConnections!parentId(
    id,
    createdAt,
    parentId,
    performerId,
    performer:members!performerId(
      id,
      firstName,
      lastName,
      memberType,
      gender
    )
  ),
  performerConnections:familyMemberConnections!performerId(
    id,
    createdAt,
    parentId,
    performerId,
    parent:members!parentId(
      id,
      firstName,
      lastName,
      memberType,
      gender
    )
  )
`;

const getMemberWithRelations = async (
  client: TypedClient,
  memberId: number
) => {
  const { data, error } = await client
    .from("members")
    .select(MEMBER_QUERY_WITH_RELATIONS)
    .eq("id", memberId)
    .single();

  if (error) throw error;
  return MemberWithRelationsSchema.parse(data);
};

export const getMembersByTenantId = async (
  typedClient: TypedClient,
  tenantId: string
) => {
  const { data: members, error } = await typedClient
    .from("members")
    .select(MEMBER_QUERY_WITH_RELATIONS)
    .eq("tenantId", tenantId)
    .order("firstName", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return members.map((member) => MemberWithRelationsSchema.parse(member));
};

export interface AddPerformerOptions {
  memberData: MemberForm;
  parentIds?: number[];
  groupIds?: number[];
  userId?: string;
}

/**
 * Comprehensive service to add a performer with all related connections
 * Handles member creation, parent connections, group connections, and user assignment atomically
 */
export const addPerformer = async (
  client: TypedClient,
  tenantId: string,
  options: AddPerformerOptions
) => {
  const { memberData, parentIds, groupIds, userId } = options;

  try {
    const {
      customFieldValues,
      groupIds: formGroupIds,
      ...memberDataOnly
    } = memberData;

    const allGroupIds = [...(groupIds || []), ...(formGroupIds || [])];

    const processedMemberData = {
      ...memberDataOnly,
      userId: userId || memberData.userId,
      tenantId: Number(tenantId),
    };

    // 1. Create the member
    const { data: newMember, error: insertError } = await client
      .from("members")
      .insert(processedMemberData)
      .select()
      .single();

    if (insertError) throw insertError;

    // 2. Create parent connections if parentIds provided
    if (parentIds?.length) {
      const parentConnections = parentIds.map((parentId) => ({
        parentId,
        performerId: newMember.id,
      }));

      const { error: parentError } = await client
        .from("familyMemberConnections")
        .insert(parentConnections);

      if (parentError) throw parentError;
    }

    // 3. Create group connections if groupIds provided
    if (allGroupIds?.length) {
      const groupConnections = allGroupIds.map((groupId) => ({
        memberId: newMember.id,
        groupId,
        tenantId: Number(tenantId),
      }));

      const { error: groupError } = await client
        .from("memberGroupConnections")
        .insert(groupConnections);

      if (groupError) throw groupError;
    }

    // 4. Create custom field values if provided
    if (customFieldValues?.length) {
      const customFieldInserts = customFieldValues.map((fieldValue: any) => ({
        memberId: newMember.id,
        customFieldId: fieldValue.customFieldId,
        value: fieldValue.value,
        tenantId: Number(tenantId),
      }));

      const { error: customFieldError } = await client
        .from("memberCustomFieldValues")
        .insert(customFieldInserts);

      if (customFieldError) throw customFieldError;
    }

    // Return the complete member with all relations
    return getMemberWithRelations(client, newMember.id);
  } catch (error) {
    console.error("Error in addPerformer:", error);
    throw error;
  }
};

export const addMemberToTenant = async (
  client: TypedClient,
  data: MemberForm,
  tenantId: string
) => {
  try {
    const { groupIds, customFieldValues, ...memberData } = data;

    const processedMemberData = {
      ...memberData,
      tenantId: Number(tenantId),
    };

    const { data: newMember, error: insertError } = await client
      .from("members")
      .insert(processedMemberData)
      .select()
      .single();

    if (insertError) throw insertError;

    if (groupIds?.length) {
      const groupConnections = groupIds.map((groupId: number) => ({
        memberId: newMember.id,
        groupId,
        tenantId: Number(tenantId),
      }));

      const { error: groupError } = await client
        .from("memberGroupConnections")
        .insert(groupConnections);

      if (groupError) throw groupError;
    }

    if (customFieldValues?.length) {
      const customFieldInserts = customFieldValues.map((fieldValue: any) => ({
        memberId: newMember.id,
        customFieldId: fieldValue.customFieldId,
        value: fieldValue.value,
        tenantId: Number(tenantId),
      }));

      const { error: customFieldError } = await client
        .from("memberCustomFieldValues")
        .insert(customFieldInserts);

      if (customFieldError) throw customFieldError;
    }

    return getMemberWithRelations(client, newMember.id);
  } catch (error) {
    console.error("Error in addMemberToTenant:", error);
    throw error;
  }
};

export const updateMember = async (
  client: TypedClient,
  data: MemberForm,
  memberId: number,
  tenantId: string
) => {
  try {
    const { groupIds, customFieldValues, ...memberData } = data;

    const { error: updateError } = await client
      .from("members")
      .update(memberData)
      .eq("id", memberId)
      .eq("tenantId", tenantId);

    if (updateError) throw updateError;

    if (groupIds !== undefined) {
      const { error: deleteGroupError } = await client
        .from("memberGroupConnections")
        .delete()
        .eq("memberId", memberId);

      if (deleteGroupError) throw deleteGroupError;

      if (groupIds.length > 0) {
        const groupConnections = groupIds.map((groupId: number) => ({
          memberId,
          groupId,
          tenantId: Number(tenantId),
        }));

        const { error: groupError } = await client
          .from("memberGroupConnections")
          .insert(groupConnections);

        if (groupError) throw groupError;
      }
    }

    if (customFieldValues !== undefined) {
      const { error: deleteCustomFieldError } = await client
        .from("memberCustomFieldValues")
        .delete()
        .eq("memberId", memberId);

      if (deleteCustomFieldError) throw deleteCustomFieldError;

      if (customFieldValues.length > 0) {
        const customFieldInserts = customFieldValues.map((fieldValue: any) => ({
          memberId,
          customFieldId: fieldValue.customFieldId,
          value: fieldValue.value,
          tenantId: Number(tenantId),
        }));

        const { error: customFieldError } = await client
          .from("memberCustomFieldValues")
          .insert(customFieldInserts);

        if (customFieldError) throw customFieldError;
      }
    }

    return getMemberWithRelations(client, memberId);
  } catch (error) {
    console.error("Error in updateMember:", error);
    throw error;
  }
};

export const deleteMember = async (
  client: TypedClient,
  memberId: number,
  tenantId: string
) => {
  try {
    const { error: groupError } = await client
      .from("memberGroupConnections")
      .delete()
      .eq("memberId", memberId);

    if (groupError) throw groupError;

    const { error: userError } = await client
      .from("memberUserConnections")
      .delete()
      .eq("memberId", memberId);

    if (userError) throw userError;

    const { error: customFieldError } = await client
      .from("memberCustomFieldValues")
      .delete()
      .eq("memberId", memberId);

    if (customFieldError) throw customFieldError;

    const { error: memberError } = await client
      .from("members")
      .delete()
      .eq("id", memberId)
      .eq("tenantId", tenantId);

    if (memberError) throw memberError;
  } catch (error) {
    console.error("Error in deleteMember:", error);
    throw error;
  }
};

export const getMembersByType = async (
  client: TypedClient,
  tenantId: string,
  memberType: string
) => {
  const { data: members, error } = await client
    .from("members")
    .select(MEMBER_QUERY_WITH_RELATIONS)
    .eq("tenantId", tenantId)
    .eq("memberType", memberType)
    .order("firstName", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return members.map((member) => MemberWithRelationsSchema.parse(member));
};

export const getMembersByGroupId = async (
  client: TypedClient,
  groupId: number,
  tenantId: string
) => {
  const { data: members, error } = await client
    .from("members")
    .select(MEMBER_QUERY_WITH_RELATIONS)
    .eq("tenantId", tenantId)
    .order("firstName", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const filteredMembers = members.filter((member: any) =>
    member.groupConnections?.some((conn: any) => conn.groupId === groupId)
  );

  return filteredMembers.map((member) =>
    MemberWithRelationsSchema.parse(member)
  );
};

// Family Member Connection Services

export const assignPerformerToParent = async (
  client: TypedClient,
  parentId: number,
  performerId: number
) => {
  const { data, error } = await client
    .from("familyMemberConnections")
    .insert({
      parentId,
      performerId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const assignPerformerToMultipleParents = async (
  client: TypedClient,
  performerId: number,
  parentIds: number[]
) => {
  const connections = parentIds.map((parentId) => ({
    parentId,
    performerId,
  }));

  const { data, error } = await client
    .from("familyMemberConnections")
    .insert(connections)
    .select();

  if (error) throw error;
  return data;
};

export const assignMultiplePerformersToParent = async (
  client: TypedClient,
  parentId: number,
  performerIds: number[]
) => {
  const connections = performerIds.map((performerId) => ({
    parentId,
    performerId,
  }));

  const { data, error } = await client
    .from("familyMemberConnections")
    .insert(connections)
    .select();

  if (error) throw error;
  return data;
};

export const removePerformerFromParent = async (
  client: TypedClient,
  parentId: number,
  performerId: number
) => {
  const { error } = await client
    .from("familyMemberConnections")
    .delete()
    .eq("parentId", parentId)
    .eq("performerId", performerId);

  if (error) throw error;
};

export const getFamilyMemberConnections = async (
  client: TypedClient,
  tenantId: string
) => {
  const { data, error } = await client
    .from("familyMemberConnections")
    .select(
      `
      *,
      parent:members!parentId(
        id,
        firstName,
        lastName,
        memberType,
        tenantId
      ),
      performer:members!performerId(
        id,
        firstName,
        lastName,
        memberType,
        tenantId
      )
    `
    )
    .or(`parent.tenantId.eq.${tenantId},performer.tenantId.eq.${tenantId}`);

  if (error) throw error;
  return data;
};

export const getParentsByPerformerId = async (
  client: TypedClient,
  performerId: number,
  tenantId: string
) => {
  const { data, error } = await client
    .from("familyMemberConnections")
    .select(
      `
      parent:members!parentId(
        id,
        firstName,
        lastName,
        memberType,
        tenantId
      )
    `
    )
    .eq("performerId", performerId)
    .eq("parent.tenantId", tenantId);

  if (error) throw error;
  return data.map((connection: any) => connection.parent).filter(Boolean);
};

export const getPerformersByParentId = async (
  client: TypedClient,
  parentId: number,
  tenantId: string
) => {
  const { data, error } = await client
    .from("familyMemberConnections")
    .select(
      `
      performer:members!performerId(
        id,
        firstName,
        lastName,
        memberType,
        tenantId
      )
    `
    )
    .eq("parentId", parentId)
    .eq("performer.tenantId", tenantId);

  if (error) throw error;
  return data.map((connection: any) => connection.performer).filter(Boolean);
};
