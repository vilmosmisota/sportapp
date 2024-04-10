import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTeamStatisticsByDivisionId } from "@/entities/team-statistics/TeamStatistics.services";

type StandingProps = {
  domain: string;
};

export default async function Standing({ domain }: StandingProps) {
  const data = await getTeamStatisticsByDivisionId("1", domain);

  return (
    <div className="col-span-2">
      <h2>{data.divisions[0].name}</h2>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Wins</TableHead>
              <TableHead>Draws</TableHead>
              <TableHead>Losses</TableHead>
              <TableHead>Streak</TableHead>
              <TableHead>Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.divisions[0].teamStatistics.map((team) => {
              return (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">
                    {team.organizationName}
                  </TableCell>
                  <TableCell>{team.wins}</TableCell>
                  <TableCell>{team.draws}</TableCell>
                  <TableCell>{team.losses}</TableCell>
                  <TableCell>{team.streak}</TableCell>
                  <TableCell>{team.points}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
