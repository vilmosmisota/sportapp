import { getFeaturedGames } from "@/entities/game/Game.services.server";
import FeaturedGameResults from "../components/FeaturedGameResults";

export default async function FeaturedGameResultsBlock({
  domain,
}: {
  domain: string;
}) {
  // const games = await getFeaturedGames(domain);

  return <FeaturedGameResults />;
}
