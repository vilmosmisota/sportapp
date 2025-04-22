import {
  PageHeaderSkeleton,
  TableSkeleton,
  PlayerTableCellSkeleton,
  PlayerTableColumnType,
} from "@/components/loader-blocks";

export default function PlayersLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Header section */}
      <PageHeaderSkeleton
        titleWidth="w-40"
        descriptionWidth="w-[380px]"
        actionButtonsWidth={["w-[120px]"]}
      />

      {/* Players table */}
      <TableSkeleton
        columnCount={6}
        rowCount={7}
        columnWidths={["w-36", "w-28", "w-20", "w-16", "w-32", "w-10"]}
        renderCustomCell={(colIndex, rowIndex) => (
          <PlayerTableCellSkeleton
            columnType={colIndex as PlayerTableColumnType}
            rowIndex={rowIndex}
          />
        )}
      />
    </div>
  );
}
