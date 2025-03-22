import { format } from "date-fns";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Season } from "@/entities/season/Season.schema";
import { useUpdateSeason } from "@/entities/season/Season.actions.client";
import { AlertCircle } from "lucide-react";

interface Props {
  seasons: Season[];
  selectedSeason: Season | null;
  tenantId: string;
}

const SeasonSelect = React.forwardRef<HTMLDivElement, Props>(
  ({ seasons, selectedSeason, tenantId }, ref) => {
    const { mutate: setActiveSeason } = useUpdateSeason(
      selectedSeason?.id.toString() ?? "",
      tenantId
    );

    const hasNoSeasons = seasons.length === 0;

    if (hasNoSeasons) {
      return (
        <div ref={ref} className="relative">
          <div className="flex h-11 w-[200px] items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm cursor-not-allowed opacity-50">
            <div className="flex items-center gap-2">
              <span className="truncate">No seasons available</span>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref}>
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
                  `${format(
                    new Date(season.startDate),
                    "dd/MM/yyyy"
                  )} - ${format(new Date(season.endDate), "dd/MM/yyyy")}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
);

SeasonSelect.displayName = "SeasonSelect";

export default SeasonSelect;
