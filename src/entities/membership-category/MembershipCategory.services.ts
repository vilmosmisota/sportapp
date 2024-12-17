import { TypedClient } from "@/libs/supabase/type";
import {
  MembershipCategory,
  MembershipCategoryForm,
  MembershipCategorySchema,
} from "./MembershipCategory.schema";

export const getMembershipCategories = async (
  typedClient: TypedClient,
  tenantId: number
) => {
  const { data, error } = await typedClient
    .from("membershipCategories")
    .select("*")
    .eq("tenantId", `${tenantId}`);

  if (error) {
    throw new Error(error.message);
  }

  const validatedData = data.map((playerFeeCategory) =>
    MembershipCategorySchema.parse(playerFeeCategory)
  );
  return validatedData;
};

export const addMembershipCategory = async (
  client: TypedClient,
  data: MembershipCategoryForm,
  tenantId: string
) => {
  const { data: membershipCategory, error } = await client
    .from("membershipCategories")
    .insert({ ...data, tenantId: Number(tenantId) })
    .eq("tenantId", `${tenantId}`)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return membershipCategory;
};

export const updateMembershipCategory = async (
  client: TypedClient,
  data: MembershipCategoryForm,
  categoryId: string,
  tenantId: string
) => {
  const { data: membershipCategory, error } = await client
    .from("membershipCategories")
    .update({ ...data, tenantId: Number(tenantId), id: Number(categoryId) })
    .eq("id", categoryId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const validatedData = MembershipCategorySchema.parse(membershipCategory);

  return validatedData;
};

export const deleteMembershipCategoryById = async (
  client: TypedClient,
  categoryId: string,
  tenantId: string
) => {
  // First, delete all related seasonMembershipPrices
  const { error: pricesError } = await client
    .from("seasonMembershipPrices")
    .delete()
    .eq("membershipCategoryId", categoryId);

  if (pricesError) {
    throw new Error(`Failed to delete related prices: ${pricesError.message}`);
  }

  // Then delete the membership category
  const { error: categoryError } = await client
    .from("membershipCategories")
    .delete()
    .eq("id", categoryId)
    .eq("tenantId", tenantId);

  if (categoryError) {
    throw new Error(`Failed to delete category: ${categoryError.message}`);
  }

  return true;
};
