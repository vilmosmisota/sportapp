"use client";

import DivisionDropDown from "@/app/[domain]/components/DivisionDropDown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DivisionsSchema,
  TeamTableOnDivisionsSchema,
} from "@/entities/team-statistics/TeamStatistics.schema";
import { useState } from "react";
import { z } from "zod";

type DivisionSelectorProps = {
  teamTable: z.output<typeof TeamTableOnDivisionsSchema>;
};

export default function DivisionSelector({ teamTable }: DivisionSelectorProps) {
  const [selectedDivison, setSelectedDivision] = useState<
    z.output<typeof DivisionsSchema>
  >(teamTable.divisions[0]);

  const selectionItems = teamTable.divisions.map((division) => {
    return {
      value: division.id.toString(),
      label: `${division.level} `,
    };
  });

  const handleSelect = (id: string) => {
    const selectedDivision = teamTable.divisions.find(
      (division) => division.id.toString() === id
    );
    if (selectedDivision) {
      setSelectedDivision(selectedDivision);
    }
  };
  return (
    <div className="">
      <div className="w-full  flex flex-wrap gap-2 items-center justify-center  rounded-t-lg bg-bar p-2">
        <div className="text-center w-full font-semibold">Standing</div>
        <div className="flex gap-4 flex-col md:flex-row w-full items-center justify-center">
          <DivisionDropDown
            selectionItems={selectionItems}
            onSelect={handleSelect}
          />

          <div className="flex items-center capitalize gap-1 text-sm font-semibold text-muted-foreground ">
            <div>{selectedDivison.level}</div>
            <div>-</div>
            <div>{selectedDivison.age}</div>
            <div>-</div>
            <div>{selectedDivison.gender}</div>
          </div>
        </div>
      </div>
      <div className="border rounded-b-lg">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Wins</TableHead>
              <TableHead>Draws</TableHead>
              <TableHead>Losses</TableHead>
              <TableHead>Streak</TableHead>
              <TableHead>GF</TableHead>
              <TableHead>GA</TableHead>
              <TableHead>GD</TableHead>
              <TableHead>Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedDivison.teamStatistics.map((team, i) => {
              return (
                <TableRow key={team.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <div>{`${i + 1}.`}</div>
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-secondary-muted text-xs">
                        {team.organizationShortName}
                      </AvatarFallback>
                    </Avatar>
                    <div> {team.organizationName}</div>
                  </TableCell>
                  <TableCell>{team.wins}</TableCell>
                  <TableCell>{team.draws}</TableCell>
                  <TableCell>{team.losses}</TableCell>
                  <TableCell>{team.streak}</TableCell>
                  <TableCell>{team.goalsFor}</TableCell>
                  <TableCell>{team.goalsAgainst}</TableCell>
                  <TableCell>{team.goalDifference}</TableCell>
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
