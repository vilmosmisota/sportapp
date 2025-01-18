"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Team } from "@/entities/team/Team.schema";
import { Player, PlayerGender } from "@/entities/player/Player.schema";
import { usePlayers } from "@/entities/player/Player.actions.client";
import { useAddPlayerToTeam } from "@/entities/player/PlayerTeam.actions.client";

import { differenceInYears, parseISO } from "date-fns";
import FormButtons from "@/components/ui/form-buttons";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  playerIds: z.array(z.number()),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  team: Team;
  tenantId: string;
  setIsOpen: (open: boolean) => void;
}

// Helper functions
const parseTeamAge = (teamAge: string | null): number | null => {
  if (!teamAge) return null;
  const match = teamAge.match(/u(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

const isPlayerAgeCompatible = (
  playerAge: number,
  teamAge: string | null
): boolean => {
  const parsedTeamAge = parseTeamAge(teamAge);
  if (parsedTeamAge === null) return false;
  return playerAge <= parsedTeamAge;
};

const mapPlayerToTeamGender = (playerGender: PlayerGender): string => {
  switch (playerGender) {
    case PlayerGender.Male:
      return "Male";
    case PlayerGender.Female:
      return "Female";
    default:
      return "Mixed";
  }
};

interface PlayerTableProps {
  players: Player[];
  selectedIds: number[];
  onTogglePlayer: (playerId: number) => void;
}

const PlayerTable = ({
  players,
  selectedIds,
  onTogglePlayer,
}: PlayerTableProps) => {
  // Memoize the table content to prevent unnecessary re-renders
  const tableContent = useMemo(
    () => (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Position</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const age = player.dateOfBirth
              ? differenceInYears(new Date(), parseISO(player.dateOfBirth))
              : null;

            return (
              <TableRow key={player.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(player.id)}
                    onCheckedChange={() => onTogglePlayer(player.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {player.firstName} {player.lastName}
                </TableCell>
                <TableCell>{age ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {player.gender?.toLowerCase() ?? "-"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {player.position?.toLowerCase() ?? "-"}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
          {players.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No players available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    ),
    [players, selectedIds, onTogglePlayer]
  );

  return tableContent;
};

export default function ManagePlayersForm({
  team,
  tenantId,
  setIsOpen,
}: Props) {
  const { data: players } = usePlayers(tenantId);
  const addPlayerToTeam = useAddPlayerToTeam(tenantId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerIds: [],
    },
  });

  // Get existing player IDs in the team
  const existingPlayerIds = useMemo(
    () =>
      new Set(
        team.playerTeamConnections
          ?.map((connection) => connection.player?.id)
          .filter((id): id is number => id !== undefined) ?? []
      ),
    [team]
  );

  // Group available players
  const { recommendedPlayers, otherPlayers } = useMemo(() => {
    if (!players) return { recommendedPlayers: [], otherPlayers: [] };

    const recommended: Player[] = [];
    const others: Player[] = [];

    players.forEach((player) => {
      // Skip if player is already in the team
      if (existingPlayerIds.has(player.id)) return;

      const age = player.dateOfBirth
        ? differenceInYears(new Date(), parseISO(player.dateOfBirth))
        : null;

      if (age !== null && isPlayerAgeCompatible(age, team.age)) {
        // Check gender compatibility
        if (
          team.gender === "Mixed" ||
          mapPlayerToTeamGender(player.gender as PlayerGender) === team.gender
        ) {
          recommended.push(player);
        } else {
          others.push(player);
        }
      } else {
        others.push(player);
      }
    });

    return {
      recommendedPlayers: recommended,
      otherPlayers: others,
    };
  }, [players, team, existingPlayerIds]);

  const onSubmit = async (values: FormValues) => {
    if (!values.playerIds.length) {
      toast.error("Please select at least one player");
      return;
    }

    try {
      setIsSubmitting(true);
      await Promise.all(
        values.playerIds.map((playerId) =>
          addPlayerToTeam.mutateAsync({
            teamId: team.id,
            playerId,
          })
        )
      );
      toast.success("Players assigned successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Error assigning players:", error);
      toast.error("Failed to assign players");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePlayer = (playerId: number) => {
    const currentIds = form.getValues("playerIds");
    const newIds = currentIds.includes(playerId)
      ? currentIds.filter((id) => id !== playerId)
      : [...currentIds, playerId];
    form.setValue("playerIds", newIds, { shouldDirty: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {/* Recommended Players */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Recommended Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-[calc(100vw-3rem)] md:w-full rounded-md border">
                <PlayerTable
                  players={recommendedPlayers}
                  selectedIds={form.watch("playerIds")}
                  onTogglePlayer={togglePlayer}
                />
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Other Available Players */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Other Available Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-[calc(100vw-3rem)] md:w-full rounded-md border">
                <PlayerTable
                  players={otherPlayers}
                  selectedIds={form.watch("playerIds")}
                  onTogglePlayer={togglePlayer}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
          <FormButtons
            buttonText="Assign Players"
            isLoading={isSubmitting}
            isDirty={form.formState.isDirty}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      </form>
    </Form>
  );
}
