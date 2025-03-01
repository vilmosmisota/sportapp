import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Plus, Calendar, CalendarRange } from "lucide-react";
import { useState } from "react";
import { Season } from "@/entities/season/Season.schema";
import { Team } from "@/entities/team/Team.schema";
import CreateTrainingScheduleForm from "../forms/CreateTrainingScheduleForm";
import CreateSingleTrainingForm from "../forms/CreateSingleTrainingForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  domain: string;
  selectedSeason: Season | null;
  teams: Team[];
  tenantId: string;
}

export default function CreateTrainingButton({
  domain,
  selectedSeason,
  teams,
  tenantId,
}: Props) {
  const [isPatternOpen, setIsPatternOpen] = useState(false);
  const [isSingleOpen, setIsSingleOpen] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsSingleOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Create Single Training
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsPatternOpen(true)}>
            <CalendarRange className="mr-2 h-4 w-4" />
            Create Training Pattern
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Pattern Form */}
      <ResponsiveSheet
        isOpen={isPatternOpen}
        setIsOpen={setIsPatternOpen}
        title="Create Training Pattern"
      >
        <CreateTrainingScheduleForm
          tenantId={tenantId}
          domain={domain}
          selectedSeason={selectedSeason}
          teams={teams}
          setIsOpen={setIsPatternOpen}
        />
      </ResponsiveSheet>

      {/* Single Training Form */}
      <ResponsiveSheet
        isOpen={isSingleOpen}
        setIsOpen={setIsSingleOpen}
        title="Create Single Training"
      >
        <CreateSingleTrainingForm
          tenantId={tenantId}
          domain={domain}
          selectedSeason={selectedSeason}
          teams={teams}
          setIsOpen={setIsSingleOpen}
        />
      </ResponsiveSheet>
    </>
  );
}
