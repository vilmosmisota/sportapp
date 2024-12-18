import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Team } from "@/entities/team/Team.schema";
import { MoreVertical, Users, SquarePen, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TeamsTableProps = {
  teams?: Team[];
  tenantId: string;
  setIsAddTeamOpen: (open: boolean) => void;
};

export default function TeamsTable({ teams, tenantId, setIsAddTeamOpen }: TeamsTableProps) {
  return (
    <div className="border rounded-lg w-full overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary">
          <TableRow>
            <TableHead className="text-left p-6">Name</TableHead>
            <TableHead className="text-left p-6">Age Group</TableHead>
            <TableHead className="text-left p-6">Gender</TableHead>
            <TableHead className="text-left p-6">Level</TableHead>
            <TableHead className="text-left p-6">Players</TableHead>
            <TableHead className="text-left p-6">Coach</TableHead>
            <TableHead className="text-right p-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams?.map((team) => (
            <TableRow key={team.id}>
              <TableCell className="p-6 font-medium">
                {team.name || `${team.gender} ${team.age} ${team.skill}`}
              </TableCell>
              <TableCell className="p-6">{team.age}</TableCell>
              <TableCell className="p-6">{team.gender}</TableCell>
              <TableCell className="p-6">{team.skill}</TableCell>
              <TableCell className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{team.playerCount || 0}</span>
                </div>
              </TableCell>
              <TableCell className="p-6">
                {team.coach || "Not assigned"}
              </TableCell>
              <TableCell className="text-right p-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 data-[state=open]:bg-gray-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem className="group flex w-full items-center justify-between text-left p-0 text-sm font-medium text-neutral-700">
                      <button
                        onClick={() => {}}
                        className="w-full justify-start items-center gap-2 flex rounded-md p-2 transition-all duration-75 hover:bg-gray-100"
                      >
                        <SquarePen className="h-4 w-4" />
                        Edit
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="group flex w-full items-center justify-between text-left p-0 text-sm font-medium text-neutral-700">
                      <button
                        onClick={() => {}}
                        className="w-full justify-start items-center gap-2 flex text-red-500 rounded-md p-2 transition-all duration-75 hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
