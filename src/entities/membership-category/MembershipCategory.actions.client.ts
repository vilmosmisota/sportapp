import { queryKeys } from "@/cacheKeys/cacheKeys";
import { TypedClient } from "@/libs/supabase/type";
import { useSupabase } from "@/libs/supabase/useSupabase";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import {
  MembershipCategory,
  MembershipCategoryForm,
} from "./MembershipCategory.schema";
import {
  addMembershipCategory,
  deleteMembershipCategoryById,
  updateMembershipCategory,
} from "./MembershipCategory.services";

export const useAddMembershipCategory = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.membershipCategory.all];

  return useMutation({
    mutationFn: (data: MembershipCategoryForm) => {
      return addMembershipCategory(client, data, tenantId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useUpdateMembershipCategory = (
  categoryId: string,
  tenantId: string
): UseMutationResult<
  MembershipCategory,
  Error,
  MembershipCategoryForm,
  { previousData: MembershipCategory[] | undefined }
> => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.membershipCategory.all, queryKeys.season.all];

  return useMutation({
    mutationFn: (data: MembershipCategoryForm) =>
      updateMembershipCategory(client, data, categoryId, tenantId),

    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData =
        queryClient.getQueryData<MembershipCategory[]>(queryKey);

      queryClient.setQueryData<MembershipCategory[]>(queryKey, (old) => {
        return (
          old?.map((category) =>
            category.id === Number(categoryId)
              ? {
                  ...category,
                  ...newData,
                  id: Number(categoryId),
                  tenantId: Number(tenantId),
                }
              : category
          ) ?? []
        );
      });

      return { previousData };
    },

    onError: (err, newData, context) => {
      queryClient.setQueryData<MembershipCategory[]>(
        queryKey,
        context?.previousData
      );
    },

    onSuccess: (updatedCategory, variables) => {
      queryClient.setQueryData<MembershipCategory[]>(queryKey, (old) => {
        return (
          old?.map((category) =>
            category.id === updatedCategory.id
              ? { ...category, ...updatedCategory }
              : category
          ) ?? []
        );
      });
    },
  });
};

export const useDeleteMembershipCategory = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.membershipCategory.all, queryKeys.season.all];

  return useMutation({
    mutationFn: (categoryId: string) =>
      deleteMembershipCategoryById(client, categoryId, tenantId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
};
