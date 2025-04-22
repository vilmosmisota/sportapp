import { Skeleton } from "@/components/ui/skeleton";

interface PageHeaderSkeletonProps {
  titleWidth?: string;
  descriptionWidth?: string;
  hasActions?: boolean;
  actionButtonsWidth?: string[];
}

export function PageHeaderSkeleton({
  titleWidth = "w-48",
  descriptionWidth = "w-96",
  hasActions = true,
  actionButtonsWidth = ["w-[120px]"],
}: PageHeaderSkeletonProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-1">
        <Skeleton className={`h-10 ${titleWidth}`} />
        <Skeleton className={`h-5 ${descriptionWidth}`} />
      </div>
      {hasActions && (
        <div className="flex space-x-2">
          {actionButtonsWidth.map((width, index) => (
            <Skeleton
              key={`action-btn-${index}`}
              className={`h-10 ${width} rounded-md`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
