import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Season } from "@/entities/season/Season.schema";
import { useUpdateSeason } from "@/entities/season/Season.actions.client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";

interface Props {
  seasons: Season[];
  selectedSeason: Season | null;
  tenantId: string;
}

export default function SeasonSelect({
  seasons,
  selectedSeason,
  tenantId,
}: Props) {
  const { mutate: setActiveSeason } = useUpdateSeason(
    selectedSeason?.id.toString() ?? "",
    tenantId
  );

  const hasNoSeasons = seasons.length === 0;

  if (hasNoSeasons) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Select disabled>
              <SelectTrigger className="w-[200px]">
                <div className="flex items-center gap-2">
                  <span className="truncate">No seasons available</span>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </div>
              </SelectTrigger>
            </Select>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p>Please go to Team Management and create a season first.</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Select
      value={selectedSeason?.id.toString()}
      onValueChange={(value: string) => {
        const season = seasons.find((s) => s.id.toString() === value);
        if (season) {
          setActiveSeason({ ...season, isActive: true });
        }
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select Season" />
      </SelectTrigger>
      <SelectContent>
        {seasons.map((season) => (
          <SelectItem key={season.id} value={season.id.toString()}>
            {season.customName ??
              `${format(new Date(season.startDate), "dd/MM/yyyy")} - ${format(
                new Date(season.endDate),
                "dd/MM/yyyy"
              )}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
