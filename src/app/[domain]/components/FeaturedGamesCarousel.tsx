"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { GameSchema } from "@/entities/game/Game.schema";
import { z } from "zod";
import FeaturedGameCard from "./FeaturedGameCard";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";

type FeaturedGamesCarouselProps = {
  games: z.output<typeof GameSchema>[];
};

export default function FeaturedGamesCarousel({
  games,
}: FeaturedGamesCarouselProps) {
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

  return (
    <Carousel
      className="w-full"
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[plugin.current]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {games.map((game) => {
          return (
            <CarouselItem key={game.id} className="basis-1/6">
              <FeaturedGameCard game={game} />
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
