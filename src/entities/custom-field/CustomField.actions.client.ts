import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCustomField, UpdateCustomField } from "./CustomFieldSchema";
import {
  createCustomField,
  deleteCustomField,
  updateCustomField,
} from "./CustomField.services";

export const useAddCustomField = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomField) =>
      createCustomField(client, data, Number(tenantId)),
    onSuccess: (_, variables) => {
      // Invalidate all custom fields
      queryClient.invalidateQueries({
        queryKey: queryKeys.customField.all,
      });
      // Invalidate the list for this entity type
      queryClient.invalidateQueries({
        queryKey: queryKeys.customField.byTenantAndEntity(
          tenantId,
          variables.entityType
        ),
      });
    },
  });
};

export const useUpdateCustomField = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fieldId,
      data,
    }: {
      fieldId: number;
      data: UpdateCustomField;
    }) => updateCustomField(client, fieldId, data, Number(tenantId)),
    onSuccess: (_, variables) => {
      // Invalidate all custom fields
      queryClient.invalidateQueries({
        queryKey: queryKeys.customField.all,
      });
      // Invalidate the detail view
      queryClient.invalidateQueries({
        queryKey: queryKeys.customField.detail(tenantId, variables.fieldId),
      });
      // If entity type is being updated, invalidate both old and new entity type lists
      if (variables.data.entityType) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.customField.byTenantAndEntity(
            tenantId,
            variables.data.entityType
          ),
        });
      }
    },
  });
};

export const useDeleteCustomField = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fieldId,
      entityType,
    }: {
      fieldId: number;
      entityType: string;
    }) => deleteCustomField(client, fieldId, Number(tenantId)),
    onSuccess: (_, variables) => {
      // Invalidate all custom fields
      queryClient.invalidateQueries({
        queryKey: queryKeys.customField.all,
      });
      // Invalidate the detail view
      queryClient.invalidateQueries({
        queryKey: queryKeys.customField.detail(tenantId, variables.fieldId),
      });
      // Invalidate the list for this entity type
      queryClient.invalidateQueries({
        queryKey: queryKeys.customField.byTenantAndEntity(
          tenantId,
          variables.entityType
        ),
      });
    },
  });
};
