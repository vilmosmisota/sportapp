import { useSupabase } from "@/libs/supabase/useSupabase";

import { useQuery } from "@tanstack/react-query";
import { getUser } from "./User.services.client";

export const useGetUser = () => {
  const client = useSupabase();
  const queryKey = [""];
  const queryFn = async () => {
    const data = await getUser(client);
    return data;
  };

  return useQuery({ queryKey, queryFn });
};
