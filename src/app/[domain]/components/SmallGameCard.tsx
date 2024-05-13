import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GameSchema } from "@/entities/game/Game.schema";
import { z } from "zod";

type FeaturedGameCardProps = {
  game: z.output<typeof GameSchema>;
};

export default function SmallGameCard({ game }: FeaturedGameCardProps) {
  const [hours, minutes] = game.startTime.split(":");

  return (
    <Card className={"bg-muted min-h-[180px] flex flex-col justify-between"}>
      <CardHeader className="py-2 ">
        <div className="flex flex-wrap justify-between text-xs md:text-sm font-semibold capitalize">
          <div>{game.divisionLevel}</div>
          <div>{game.divisionAge}</div>
          <div>{game.divisionGender}</div>
        </div>

        <CardDescription className="text-xs md:text-sm">
          {new Date(game.date).toLocaleString("en-UK", {
            month: "long",
            day: "numeric",
          })}{" "}
          {`${hours}:${minutes}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2 px-4 mx-2 space-y-2 border-t-2 border-b-2">
        <div className="flex justify-between text-xs md:text-sm">
          <div>{game.homeTeamOrgShortName}</div>
          <div>{game.homeTeamScore}</div>
        </div>
        <div className="flex justify-between text-xs md:text-sm">
          <div>{game.awayTeamOrgShortName}</div>
          <div>{game.awayTeamScore}</div>
        </div>
      </CardContent>

      <CardFooter className="py-2 text-xs md:text-sm">
        {game.awayTeamScore === game.homeTeamScore ? (
          <div className="font-semibold">Draw</div>
        ) : (
          <div className="truncate">
            <span className="font-semibold">W:</span>{" "}
            <span className="">
              {getWinner(
                {
                  score: game.homeTeamScore,
                  name: game.homeTeamOrganizationName,
                },
                {
                  score: game.awayTeamScore,
                  name: game.awayTeamOrganizationName,
                }
              )}
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

function getWinner(
  home: { score: string | undefined; name: string },
  away: { score: string | undefined; name: string }
) {
  if (Number(home.score) > Number(away.score)) {
    return home.name;
  }
  return away.name;
}
