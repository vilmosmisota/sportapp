import { useSupabase } from "@/libs/supabase/useSupabase";
import { getUpcomingGamesByDivisionId } from "./Game.services.client";
import { useQuery } from "@tanstack/react-query";

export const useUpcomingGamesByDivisionId = (
  divisionId: number,
  domain: string
) => {
  const client = useSupabase();
  const queryKey = [divisionId, domain];
  const queryFn = async () => {
    const data = await getUpcomingGamesByDivisionId(client, domain, divisionId);

    return data;
  };

  return useQuery({ queryKey, queryFn });
};
