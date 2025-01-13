import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { updatePlayerPin } from "./Player.services";
import { queryKeys } from "@/cacheKeys/cacheKeys";

export const useUpdatePlayerPin = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playerId, pin }: { playerId: number; pin: string }) =>
      updatePlayerPin(client, playerId, pin, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.player.all],
      });
    },
  });
};
