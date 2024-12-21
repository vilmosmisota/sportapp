import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Team } from "@/entities/team/Team.schema";
import { MoreVertical, Users, SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteTeam } from "@/entities/team/Team.actions.client";
import { toast } from "sonner";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import EditTeamForm from "../forms/EditTeamForm";

type TeamsTableProps = {
  teams?: Team[];
  tenantId: string;
  canManageTeams: boolean;
};

export default function TeamsTable({
  teams,
  tenantId,
  canManageTeams,
}: TeamsTableProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const deleteTeam = useDeleteTeam(tenantId);

  const handleDelete = (teamId: number) => {
    deleteTeam.mutate(teamId, {
      onSuccess: () => {
        toast.success("Team deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete team");
      },
    });
  };

  return (
    <>
      {selectedTeam && (
        <ResponsiveSheet
          isOpen={isEditOpen && !isDropdownOpen}
          setIsOpen={setIsEditOpen}
          title="Edit Team"
        >
          <EditTeamForm
            team={selectedTeam}
            tenantId={tenantId}
            setIsParentModalOpen={setIsEditOpen}
          />
        </ResponsiveSheet>
      )}

      <Card className="w-full">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Age Group</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Coach</TableHead>
                {canManageTeams && (
                  <TableHead className="text-right w-[100px]">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams?.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">
                    {team.name || `${team.gender} ${team.age} ${team.skill}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{team.age}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{team.gender}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{team.skill}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{team.playerCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {team.coach ? `${team.coach.firstName} ${team.coach.lastName}` : "Not assigned"}
                  </TableCell>
                  {canManageTeams && (
                    <TableCell className="text-right">
                      <DropdownMenu onOpenChange={setIsDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTeam(team);
                              setIsEditOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <SquarePen className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(team.id)}
                            className="cursor-pointer text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
}
