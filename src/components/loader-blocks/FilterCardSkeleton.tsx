import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface FilterCardSkeletonProps {
  pillCount?: number;
  pillWidths?: string[];
  cardClassName?: string;
  contentClassName?: string;
}

export function FilterCardSkeleton({
  pillCount = 4,
  pillWidths = ["w-32", "w-36", "w-28", "w-40"],
  cardClassName = "mb-4 shadow-none border",
  contentClassName = "py-4",
}: FilterCardSkeletonProps) {
  return (
    <Card className={cardClassName}>
      <CardContent className={contentClassName}>
        <div className="flex flex-wrap gap-2">
          {Array(pillCount)
            .fill(0)
            .map((_, i) => (
              <Skeleton
                key={`filter-pill-${i}`}
                className={`h-8 ${
                  pillWidths[i % pillWidths.length]
                } rounded-full`}
              />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
