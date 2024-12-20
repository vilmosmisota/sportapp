import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import SeasonItem from "../items/SeasonItem";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { CurrencyTypes } from "@/entities/common/Types";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Active Seasons
        </h3>
        <Button size="sm" className="gap-2" onClick={() => {}}>
          <Plus className="h-4 w-4" />
          Add Season
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {seasons?.map((season) => (
          <SeasonItem
            key={season.id}
            season={season}
            currency={currency ?? CurrencyTypes.GBP}
          />
        ))}
        {seasons?.length === 0 && (
          <Card className="col-span-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <p>No seasons added yet</p>
              <p className="text-sm">
                Click the + button to add your first season
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
