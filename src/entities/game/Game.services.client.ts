import { TypedClient } from "../../libs/supabase/type";
import { GameSchema } from "./Game.schema";

export const getUpcomingGamesByDivisionId = async (
  browserClient: TypedClient,
  domain: string,
  divisionId: number
) => {
  const { data: games, error } = await browserClient.rpc(
    "get_featured_upcoming_games",
    {
      division_id_param: divisionId,
      domain_param: domain,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return GameSchema.parse(games);
};
