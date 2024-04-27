import { TypedBrowserClient } from "@/libs/supabase/client";
import { GameSchema, GameWithAddressSchema } from "./Game.schema";

export const getUpcomingGamesByDivisionId = async (
  browserClient: TypedBrowserClient,
  domain: string,
  divisionId: number
) => {
  const { data, error } = await browserClient.rpc(
    "get_featured_upcoming_games",
    {
      division_id_param: divisionId,
      domain_param: domain,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data.map((game) => GameSchema.parse(game));
};
