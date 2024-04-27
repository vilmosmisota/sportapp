"use server";

import { getServerClient } from "@/libs/supabase/server";
import { cookies } from "next/headers";
import { GameSchema } from "./Game.schema";

export const getFeaturedGames = async (domain: string) => {
  const cookieStore = cookies();
  const serverClient = getServerClient(cookieStore);

  const { data, error } = await serverClient.rpc("get_featured_game_results", {
    domain_param: domain,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((game) => GameSchema.parse(game));
};
