import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomField,
  deleteCustomField,
  getCustomFieldById,
  getCustomFieldsByTenantAndEntity,
  updateCustomField,
} from "./CustomField.services";
import type { CreateCustomField, UpdateCustomField } from "./CustomFieldSchema";

export const useCustomFieldsByTenantAndEntity = (
  tenantId: string,
  entityType: string
) => {
  const client = useSupabase();
  const queryKey = queryKeys.customField.byTenantAndEntity(
    tenantId,
    entityType
  );

  return useQuery({
    queryKey,
    queryFn: () =>
      getCustomFieldsByTenantAndEntity(client, Number(tenantId), entityType),
    enabled: !!tenantId && !!entityType,
  });
};

export const useCustomFieldById = (tenantId: string, fieldId: number) => {
  const client = useSupabase();
  const queryKey = queryKeys.customField.detail(tenantId, fieldId);

  return useQuery({
    queryKey,
    queryFn: () => getCustomFieldById(client, fieldId, Number(tenantId)),
    enabled: !!tenantId && !!fieldId,
  });
};

export const useCreateCustomField = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomField) =>
      createCustomField(client, data, Number(tenantId)),
    onSuccess: (_, variables) => {
      // Invalidate the list query for this entity type
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
      // Invalidate both the list and detail queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.customField.detail(tenantId, variables.fieldId),
      });
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
      // Invalidate both the list and detail queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.customField.detail(tenantId, variables.fieldId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.customField.byTenantAndEntity(
          tenantId,
          variables.entityType
        ),
      });
    },
  });
};
