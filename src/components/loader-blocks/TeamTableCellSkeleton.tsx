import { Skeleton } from "@/components/ui/skeleton";

export enum TeamTableColumnType {
  TeamName,
  Category,
  Members,
  Status,
  Actions,
}

interface TeamTableCellSkeletonProps {
  columnType: TeamTableColumnType;
  rowIndex: number;
}

export function TeamTableCellSkeleton({
  columnType,
  rowIndex,
}: TeamTableCellSkeletonProps) {
  switch (columnType) {
    // Team name with avatar
    case TeamTableColumnType.TeamName:
      return (
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
      );

    // Team category/type column
    case TeamTableColumnType.Category:
      return <Skeleton className="h-4 w-24" />;

    // Members column with avatars
    case TeamTableColumnType.Members:
      return (
        <div className="flex space-x-1">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          {rowIndex % 2 === 0 && <Skeleton className="h-6 w-6 rounded-full" />}
        </div>
      );

    // Status badge column
    case TeamTableColumnType.Status:
      return <Skeleton className="h-7 w-16 rounded-full" />;

    // Actions column
    case TeamTableColumnType.Actions:
      return <Skeleton className="h-8 w-8 rounded-md ml-auto" />;

    default:
      return <Skeleton className="h-5 w-full" />;
  }
}
