import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type OpponentForm } from "./Opponent.schema";
import {
  createOpponent,
  updateOpponent,
  deleteOpponent,
} from "./Opponent.services";

export const useCreateOpponent = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OpponentForm) => createOpponent(client, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opponent.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
};

export const useUpdateOpponent = (opponentId: number, tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<OpponentForm>) =>
      updateOpponent(client, opponentId, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opponent.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.opponent.detail(tenantId, String(opponentId)),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
};

export const useDeleteOpponent = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (opponentId: number) =>
      deleteOpponent(client, opponentId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opponent.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
};
