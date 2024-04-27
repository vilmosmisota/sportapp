"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUpcomingGamesByDivisionId } from "@/entities/game/Game.queries";

import { useState } from "react";

export default function FeaturedUpcomingGames({ domain }: { domain: string }) {
  const [divisionId, setDivisionId] = useState(1);
  const {
    data: games,
    isLoading,
    isError,
    error,
  } = useUpcomingGamesByDivisionId(divisionId, domain);

  if (isError && !games) {
    return <div>Error</div>;
  }

  return (
    <div className="border rounded-lg h-full">
      <header className="w-full  font-semibold   rounded-t-lg bg-muted p-2 border-b">
        <div className="text-center mb-2 ">Upcoming games</div>
        <div className="flex items-center mb-2 w-full justify-stretch gap-2 ">
          <Combobox label="Select division..." list={[]} onSelect={() => {}} />
          <Button className="w-full" variant={"outline"}>
            7 days
          </Button>
          <Button className="w-full" variant={"secondary"}>
            14 days
          </Button>
        </div>
        <div className="h-8 border-t pt-2 text-center text-sm text-muted-foreground capitalize">
          division 2 - u16 - male
        </div>
      </header>
      <section className=" ">
        <ScrollArea className="h-[500px] w-full  py-4 px-2">
          {games?.map((game) => {
            const [hours, minutes] = game.startTime
              ? game.startTime.split(":")
              : [0, 0];

            return (
              <Card key={game.id} className="bg-muted mb-4">
                <CardHeader className="py-2">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <div className="w-5/12 text-wrap text-right">
                      {game.homeTeamOrganizationName}
                    </div>
                    <div className="w-2/12 font-normal text-center">vs</div>
                    <div className="w-5/12 text-wrap text-left">
                      {game.awayTeamOrganizationName}
                    </div>
                  </div>
                  <CardDescription className="text-center font-semibold border-t border-b py-2">
                    {new Date(game.date ?? "").toLocaleString("en-UK", {
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    {`${hours}:${minutes}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-right">
                  <div>{game.streetAddress}</div>
                  <div>{game.postalCode}</div>
                  <div>{game.city}</div>
                </CardContent>
              </Card>
            );
          })}
        </ScrollArea>
      </section>
    </div>
  );
}
