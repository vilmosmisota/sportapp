import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface CalendarSkeletonProps {
  dayCount?: number;
  rowCount?: number;
  showRandomEvents?: boolean;
  height?: string;
}

export function CalendarSkeleton({
  dayCount = 35,
  rowCount = 5,
  showRandomEvents = true,
  height = "h-[500px]",
}: CalendarSkeletonProps) {
  const days = Array(dayCount).fill(0);
  const daysPerRow = Math.ceil(dayCount / rowCount);

  return (
    <Card>
      <CardContent className="py-6">
        {/* Calendar navigation */}
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-40" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {Array(7)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={`dayname-${i}`} className="h-6 rounded" />
            ))}
        </div>

        {/* Calendar days grid */}
        <div className={`grid grid-cols-7 gap-1 ${height}`}>
          {days.map((_, i) => (
            <div
              key={`day-${i}`}
              className="border rounded-md p-2 min-h-24 h-full flex flex-col"
            >
              <Skeleton className="h-5 w-5 rounded-full mb-2" />
              {/* Some days might have events */}
              {showRandomEvents && Math.random() > 0.6 && (
                <div className="space-y-1 mt-1">
                  <Skeleton className="h-8 w-full rounded-sm" />
                  {Math.random() > 0.7 && (
                    <Skeleton className="h-8 w-full rounded-sm" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
