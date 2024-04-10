import { getFeaturedGames } from "@/entities/game/Game.services";
import FeaturedGames from "./components/FeaturedGames";
import Standing from "../components/menu/standing/Standing";

export default async function DomainPage({
  params,
}: {
  params: { domain: string };
}) {
  return (
    <div>
      <FeaturedGames domain={params.domain} />

      <div className="grid grid-cols-3 ">
        <Standing domain={params.domain} />
        <div className="col-span-1">Some other stuff</div>
      </div>
    </div>
  );
}
