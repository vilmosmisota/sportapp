import { TypedClient } from "@/libs/supabase/type";
import { Group } from "./Group.schema";

export const getGroups = async (
  client: TypedClient,
  tenantId: string
): Promise<Group[]> => {
  const { data, error } = await client
    .from("groups")
    .select("*")
    .eq("tenantId", Number(tenantId));

  if (error) throw error;

  return data || [];
};

export const createGroup = async (
  client: TypedClient,
  tenantId: string,
  groupData: Omit<Group, "id" | "tenantId">
): Promise<Group> => {
  const { data, error } = await client
    .from("groups")
    .insert({
      ...groupData,
      tenantId: Number(tenantId),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

export const updateGroup = async (
  client: TypedClient,
  groupId: number,
  tenantId: string,
  groupData: Partial<Omit<Group, "id" | "tenantId">>
): Promise<Group> => {
  const { data, error } = await client
    .from("groups")
    .update(groupData)
    .eq("id", groupId)
    .eq("tenantId", Number(tenantId))
    .select()
    .single();

  if (error) throw error;

  return data;
};

export const deleteGroup = async (
  client: TypedClient,
  groupId: number,
  tenantId: string
): Promise<boolean> => {
  const { error } = await client
    .from("groups")
    .delete()
    .eq("id", groupId)
    .eq("tenantId", Number(tenantId));

  if (error) throw error;

  return true;
};
