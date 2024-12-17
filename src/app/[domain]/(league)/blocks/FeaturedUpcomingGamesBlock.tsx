import FeaturedUpcomingGames from "../components/FeaturedUpcomingGames";

type FGRProps = {
  domain: string;
};

export default async function FeaturedUpcomingGamesBlock({ domain }: FGRProps) {
  return <FeaturedUpcomingGames domain={domain} />;
}
