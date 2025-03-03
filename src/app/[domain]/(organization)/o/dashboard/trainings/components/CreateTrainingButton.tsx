import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Plus, Calendar, CalendarRange, AlertCircle } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // Check if a season is selected
  const noSeasonSelected = !selectedSeason;

  // If no season is selected, render a disabled button with a tooltip
  if (noSeasonSelected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="gap-2" disabled>
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p>Please select a season first before creating trainings.</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

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
