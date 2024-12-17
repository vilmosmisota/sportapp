import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import SeasonItem from "../items/SeasonItem";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { CurrencyTypes } from "@/entities/common/Types";

type SeasonsContentProps = {
  tenantId?: number;
  currency?: CurrencyTypes;
};

export default function SeasonsContent({
  tenantId,
  currency,
}: SeasonsContentProps) {
  const {
    data: seasons,
    isLoading,
    error,
  } = useSeasonsByTenantId(tenantId?.toString() ?? "");

  if (error) {
    return <div>{error.message}</div>;
  }

  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }
  return (
    <div className="flex gap-3">
      <Button
        size={"icon"}
        variant={"outline"}
        className="rounded-full"
        onClick={() => {}}
        type="button"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <div className="grid grid-cols-2 gap-3 flex-grow">
        {seasons?.map((season) => {
          return (
            <SeasonItem
              key={season.id}
              season={season}
              currency={currency ?? CurrencyTypes.GBP}
            />
          );
        })}
      </div>
    </div>
  );
}
