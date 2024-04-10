import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay";

import FeaturedGameCard from "./FeaturedGameCard";
import { getFeaturedGames } from "@/entities/game/Game.services";
import FeaturedGamesCarousel from "./FeaturedGamesCarousel";

export default async function FeaturedGames({ domain }: { domain: string }) {
  const games = await getFeaturedGames(domain);

  return (
    <div className="mx-auto mb-5 ">
      <FeaturedGamesCarousel games={games} />
    </div>
  );
}
