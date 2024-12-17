"use client";

import { Button } from "@/components/ui/button";
import GameResultsCarousel from "./GameResultsCarousel";
import { GameSchema } from "@/entities/game/Game.schema";
import { z } from "zod";
import { useState } from "react";

type FeaturedGamesCarouselProps = {
  games?: z.infer<typeof GameSchema>[];
};

export default function FeaturedGameResults({
  games,
}: FeaturedGamesCarouselProps) {
  const [filterDuration, setFilterDuration] = useState<number>(7);

  const handleFilter = (duration: number) => {
    setFilterDuration(duration);
  };

  if (!games) {
    return null;
  }

  const filteredGames = games.filter((game) => {
    const gameDate = new Date(game.date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - gameDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= filterDuration;
  });

  return (
    <div className="flex gap-4 w-full flex-col md:flex-row">
      <div className=" bg-muted   md:w-2/12 flex items-center border flex-col justify-center gap-2 p-2 rounded-lg ">
        <div className="font-semibold text-balance">Results</div>
        <Button
          className="w-full"
          variant={filterDuration === 7 ? "secondary" : "outline"}
          onClick={() => handleFilter(7)}
        >
          7 days
        </Button>
        <Button
          className="w-full"
          variant={filterDuration === 14 ? "secondary" : "outline"}
          onClick={() => handleFilter(14)}
        >
          14 days
        </Button>
      </div>

      <GameResultsCarousel
        games={filteredGames}
        filterDuration={filterDuration}
      />
    </div>
  );
}
