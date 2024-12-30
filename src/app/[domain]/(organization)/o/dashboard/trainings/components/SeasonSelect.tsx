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
