import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updatePerformerFamilyConnections,
  UpdatePerformerFamilyConnectionsOptions,
} from "./PerformerConnection.service";

export const useUpdatePerformerFamilyConnections = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      performerId,
      options,
    }: {
      performerId: number;
      options: UpdatePerformerFamilyConnectionsOptions;
    }) => updatePerformerFamilyConnections(client, performerId, options),
    onSuccess: (_, { performerId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.familyConnections(tenantId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.byType(tenantId, "performer"),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.detail(tenantId, performerId.toString()),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.managementDashboard.byTenant(tenantId),
      });
    },
  });
};
