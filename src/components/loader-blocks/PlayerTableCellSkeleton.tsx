import { Skeleton } from "@/components/ui/skeleton";

export enum PlayerTableColumnType {
  Player, // Player name with avatar
  Teams, // Teams the player belongs to (badges)
  Position, // Position badges
  Status, // Status badge/indicator
  Contact, // Contact info
  Stats, // Player statistics
  Actions, // Action buttons/icons
}

interface PlayerTableCellSkeletonProps {
  columnType: PlayerTableColumnType;
  rowIndex: number;
}

export function PlayerTableCellSkeleton({
  columnType,
  rowIndex,
}: PlayerTableCellSkeletonProps) {
  switch (columnType) {
    // Player name with avatar
    case PlayerTableColumnType.Player:
      return (
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      );

    // Teams column (badges)
    case PlayerTableColumnType.Teams:
      return (
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          {rowIndex % 3 === 0 && <Skeleton className="h-6 w-14 rounded-full" />}
        </div>
      );

    // Position column
    case PlayerTableColumnType.Position:
      return <Skeleton className="h-6 w-20 rounded-md" />;

    // Status badge/indicator
    case PlayerTableColumnType.Status:
      return <Skeleton className="h-6 w-16 rounded-full" />;

    // Contact info
    case PlayerTableColumnType.Contact:
      return (
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      );

    // Player statistics
    case PlayerTableColumnType.Stats:
      return (
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-5 w-12" />
        </div>
      );

    // Actions column
    case PlayerTableColumnType.Actions:
      return <Skeleton className="h-8 w-8 rounded-md ml-auto" />;

    default:
      return <Skeleton className="h-5 w-full" />;
  }
}
