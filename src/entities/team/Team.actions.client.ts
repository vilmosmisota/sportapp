import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TeamForm } from "./Team.schema";
import { createTeam, deleteTeam, updateTeam } from "./Team.services";

export const useAddTeamToTenant = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.team.all];

  return useMutation({
    mutationFn: (data: TeamForm) => createTeam(client, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useUpdateTeam = (teamId: number, tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.team.all];

  return useMutation({
    mutationFn: (data: TeamForm) => updateTeam(client, data, teamId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useDeleteTeam = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.team.all];

  return useMutation({
    mutationFn: (teamId: number) => deleteTeam(client, teamId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
