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

export default function FeaturedGameCard({ game }: FeaturedGameCardProps) {
  const [hours, minutes] = game.startTime.split(":");

  return (
    <Card
      className={`${isGameInPast(game.date, game.startTime) && "bg-muted"}`}
    >
      <CardHeader className="py-2">
        <div className="flex justify-between text-sm font-semibold capitalize">
          <div>{game.divisionLevel}</div>
          <div>{game.divisionAge}</div>
          <div>{game.divisionGender}</div>
        </div>

        <CardDescription>
          {new Date(game.date).toLocaleString("en-UK", {
            month: "long",
            day: "numeric",
          })}{" "}
          {`${hours}:${minutes}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2 px-4 mx-2 space-y-2 border-t-2 border-b-2">
        <div className="flex justify-between text-sm">
          <div>{game.homeTeamOrgShortName}</div>
          <div>
            {isGameInPast(game.date, game.startTime) ? game.homeTeamScore : "-"}
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <div>{game.awayTeamOrgShortName}</div>
          <div>
            {isGameInPast(game.date, game.startTime) ? game.awayTeamScore : "-"}
          </div>
        </div>
      </CardContent>
      {isGameInPast(game.date, game.startTime) ? (
        <CardFooter className="py-2 text-sm">
          {game.awayTeamScore === game.homeTeamScore ? (
            <div className="font-semibold">Draw</div>
          ) : (
            <div className="whitespace-nowrap">
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
      ) : (
        <CardFooter className="py-2 text-sm">
          <div className="font-semibold">Upcoming</div>
        </CardFooter>
      )}
    </Card>
  );
}

function getWinner(
  home: { score: string | null; name: string },
  away: { score: string | null; name: string }
) {
  if (Number(home.score) > Number(away.score)) {
    return home.name;
  }
  return away.name;
}

export function isGameInPast(date: string, startTime: string) {
  const gameDateTime = new Date(`${date}T${startTime}`);
  const currentDateTime = new Date();

  return gameDateTime < currentDateTime;
}
