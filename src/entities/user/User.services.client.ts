import { TypedBrowserClient } from "@/libs/supabase/client";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useQuery } from "@tanstack/react-query";

export const getUser = async (browserClient: TypedBrowserClient) => {
  const {
    data: { user },
  } = await browserClient.auth.getUser();

  return user;
};

export const useGetUser = () => {
  const client = useSupabase();
  const queryKey = ["login"];
  const queryFn = async () => {
    const data = await getUser(client);
    return data;
  };

  return useQuery({ queryKey, queryFn });
};
