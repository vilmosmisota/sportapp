import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTeam, deleteTeam, updateTeam } from "./Group.services";
import { GroupForm } from "./Group.schema";
import { isOpponentGroup } from "./Group.utils";

export const useAddTeamToTenant = (
  tenantId: string,
  opponentId: number | null = null
) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.team.all];

  return useMutation({
    mutationFn: (data: GroupForm) =>
      createGroup(client, data, tenantId, opponentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      // Also invalidate opponents queries if this is an opponent team
      if (opponentId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.opponent.all });
      }
    },
  });
};

export const useUpdateTeam = (teamId: number, tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.team.all];

  return useMutation({
    mutationFn: (data: GroupForm) =>
      updateGroup(client, data, teamId, tenantId),
    onSuccess: (updatedTeam) => {
      queryClient.invalidateQueries({ queryKey });
      // Also invalidate opponents queries if this is an opponent team
      if (isOpponentGroup(updatedGroup)) {
        queryClient.invalidateQueries({ queryKey: queryKeys.opponent.all });
      }
    },
  });
};

export const useDeleteGroup = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.group.all];

  return useMutation({
    mutationFn: (groupId: number) => deleteGroup(client, groupId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      // Also invalidate opponents queries since we might have deleted an opponent team
      queryClient.invalidateQueries({ queryKey: queryKeys.opponent.all });
    },
  });
};
