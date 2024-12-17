import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { getPlayerFeeCategories } from "./PlayerFeeCategory.services";
import { useQuery } from "@tanstack/react-query";

export const usePlayerFeeCategories = (tenantId: string) => {
  const client = useSupabase();
  const queryKey = [queryKeys.playerFeeCategory.all];

  const queryFn = async () => {
    const data = await getPlayerFeeCategories(client, Number(tenantId));
    return data;
  };

  return useQuery({ queryKey, queryFn });
};
