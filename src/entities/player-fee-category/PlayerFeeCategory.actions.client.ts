import { queryKeys } from "@/cacheKeys/cacheKeys";
import { TypedClient } from "@/libs/supabase/type";
import { useSupabase } from "@/libs/supabase/useSupabase";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import {
  PlayerFeeCategory,
  PlayerFeeCategoryForm,
} from "./PlayerFeeCategory.schema";
import {
  addPlayerFeeCategory,
  updatePlayerFeeCategory,
} from "./PlayerFeeCategory.services";

export const useAddPlayerFeeCategory = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.playerFeeCategory.all];

  return useMutation({
    mutationFn: (data: PlayerFeeCategoryForm) => {
      return addPlayerFeeCategory(client, data, tenantId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useUpdatePlayerFeeCategory = (
  categoryId: string,
  tenantId: string
): UseMutationResult<
  PlayerFeeCategory,
  Error,
  PlayerFeeCategoryForm,
  { previousData: PlayerFeeCategory[] | undefined }
> => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.playerFeeCategory.all];

  return useMutation({
    mutationFn: (data: PlayerFeeCategoryForm) =>
      updatePlayerFeeCategory(client, data, categoryId, tenantId),

    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData =
        queryClient.getQueryData<PlayerFeeCategory[]>(queryKey);

      queryClient.setQueryData<PlayerFeeCategory[]>(queryKey, (old) => {
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
      queryClient.setQueryData<PlayerFeeCategory[]>(
        queryKey,
        context?.previousData
      );
    },

    onSuccess: (updatedCategory, variables) => {
      queryClient.setQueryData<PlayerFeeCategory[]>(queryKey, (old) => {
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
