import { CalendarDays, Tag } from "lucide-react";
import { Calendar } from "lucide-react";
import {
  TooltipContent,
  TooltipTrigger,
} from "../../../../components/ui/tooltip";
import { Tooltip } from "../../../../components/ui/tooltip";
import { TooltipProvider } from "../../../../components/ui/tooltip";
import { Card } from "../../../../components/ui/card";
import { CardContent } from "../../../../components/ui/card";
import { Season } from "@/entities/season/Season.schema";
import {
  formatSeasonDateRange,
  getSeasonInfo,
} from "@/entities/season/Season.utils";
import { Badge } from "../../../../components/ui/badge";
import { Skeleton } from "../../../../components/ui/skeleton";

interface ActiveSeasonBlockProps {
  activeSeason: Season | undefined;
  isLoading?: boolean;
}

export function ActiveSeasonBlock({
  activeSeason,
  isLoading = false,
}: ActiveSeasonBlockProps) {
  if (isLoading || !activeSeason) {
    return <ActiveSeasonSkeleton />;
  }

  const seasonInfo = getSeasonInfo(activeSeason);

  return (
    <Card className="bg-muted/30">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-base font-medium">Active Season</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    <span>
                      {activeSeason.customName ? (
                        <>
                          {activeSeason.customName}
                          <span className="text-muted-foreground ml-1.5 text-xs">
                            ({formatSeasonDateRange(activeSeason)})
                          </span>
                        </>
                      ) : (
                        formatSeasonDateRange(activeSeason)
                      )}
                    </span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Season Period</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1.5"
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>
                      {seasonInfo.totalDays} days{" "}
                      {(seasonInfo.daysLeft ?? 0) > 0
                        ? `(${seasonInfo.daysLeft} left)`
                        : "(ended)"}
                    </span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{seasonInfo.percentComplete}% complete</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveSeasonSkeleton() {
  return (
    <Card className="bg-muted/30">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
