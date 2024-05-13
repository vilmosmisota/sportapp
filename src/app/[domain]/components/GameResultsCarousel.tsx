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
import SmallGameCard from "./SmallGameCard";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";

type FeaturedGamesCarouselProps = {
  games: z.output<typeof GameSchema>[];
  filterDuration: number;
};

export default function GameResultsCarousel({
  games,
  filterDuration,
}: FeaturedGamesCarouselProps) {
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

  return (
    <Carousel
      className=" md:w-10/12"
      opts={{
        loop: true,
      }}
      plugins={[plugin.current]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent className="">
        {!games.length ? (
          <CarouselItem className="h-full w-full  ">
            <div className="bg-muted h-full min-h-[180px] flex items-center text-center">
              <div className="w-full">
                No results in the past {filterDuration} days
              </div>
            </div>
          </CarouselItem>
        ) : (
          games.map((game) => {
            return (
              <CarouselItem key={game.id} className="basis-1/2 md:basis-1/5 ">
                <SmallGameCard game={game} />
              </CarouselItem>
            );
          })
        )}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
