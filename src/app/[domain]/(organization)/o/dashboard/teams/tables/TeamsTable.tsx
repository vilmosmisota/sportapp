import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Team } from "@/entities/team/Team.schema";
import AddTeamsheet from "../sheets/AddTeamsheet";

type TeamsTableProps = {
  teams?: Team[];
  tenantId: string;
};

export default function TeamsTable({ teams, tenantId }: TeamsTableProps) {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Age</TableHead>
            <TableHead>Skill Level</TableHead>
            <TableHead>Gender</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams?.map((team) => (
            <TableRow key={team.id}>
              <TableCell>{team.age}</TableCell>
              <TableCell>{team.skill}</TableCell>
              <TableCell>{team.gender}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        <AddTeamsheet tenantId={tenantId.toString() ?? ""} />
      </div>
    </div>
  );
}
