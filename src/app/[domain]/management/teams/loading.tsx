import {
  PageHeaderSkeleton,
  TableSkeleton,
  TeamTableCellSkeleton,
  TeamTableColumnType,
} from "@/components/loader-blocks";

export default function TeamsLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Header section */}
      <PageHeaderSkeleton
        titleWidth="w-36"
        descriptionWidth="w-80"
        actionButtonsWidth={["w-[120px]"]}
      />

      {/* Teams table */}
      <TableSkeleton
        columnCount={5}
        rowCount={5}
        columnWidths={["w-24", "w-32", "w-40", "w-28", "w-20"]}
        renderCustomCell={(colIndex, rowIndex) => (
          <TeamTableCellSkeleton
            columnType={colIndex as TeamTableColumnType}
            rowIndex={rowIndex}
          />
        )}
      />
    </div>
  );
}
