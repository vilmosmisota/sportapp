import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addCoach, deleteCoach, updateCoach } from "./Coach.services";
import { CoachForm } from "./Coach.schema";

export const useAddCoach = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.coach.all];

  return useMutation({
    mutationFn: (data: CoachForm) => addCoach(client, data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useUpdateCoach = (coachId: string, tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.coach.all];

  return useMutation({
    mutationFn: (data: CoachForm) =>
      updateCoach(client, data, coachId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useDeleteCoach = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.coach.all];

  return useMutation({
    mutationFn: (coachId: string) => deleteCoach(client, coachId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
