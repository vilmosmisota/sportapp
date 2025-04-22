import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
  columnWidths?: string[];
  hasCardWrapper?: boolean;
  cardTitle?: boolean;
  cardTitleWidth?: string;
  renderCustomCell?: (columnIndex: number, rowIndex: number) => React.ReactNode;
}

export function TableSkeleton({
  rowCount = 5,
  columnCount = 5,
  columnWidths = ["w-24", "w-32", "w-40", "w-28", "w-20"],
  hasCardWrapper = true,
  cardTitle = true,
  cardTitleWidth = "w-24",
  renderCustomCell,
}: TableSkeletonProps) {
  const tableContent = (
    <Table>
      <TableHeader>
        <TableRow>
          {Array(columnCount)
            .fill(0)
            .map((_, i) => (
              <TableHead
                key={`header-${i}`}
                className={i === columnCount - 1 ? "text-right" : ""}
              >
                <Skeleton
                  className={`h-4 ${columnWidths[i] || "w-24"} ${
                    i === columnCount - 1 ? "ml-auto" : ""
                  }`}
                />
              </TableHead>
            ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array(rowCount)
          .fill(0)
          .map((_, rowIndex) => (
            <TableRow key={`row-${rowIndex}`}>
              {Array(columnCount)
                .fill(0)
                .map((_, colIndex) => (
                  <TableCell
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={colIndex === columnCount - 1 ? "text-right" : ""}
                  >
                    {renderCustomCell ? (
                      renderCustomCell(colIndex, rowIndex)
                    ) : (
                      <Skeleton
                        className={`h-5 ${columnWidths[colIndex] || "w-24"} ${
                          colIndex === columnCount - 1 ? "ml-auto" : ""
                        }`}
                      />
                    )}
                  </TableCell>
                ))}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );

  if (!hasCardWrapper) {
    return tableContent;
  }

  return (
    <Card>
      {cardTitle && (
        <CardHeader className="px-6 py-4">
          <Skeleton className={`h-5 ${cardTitleWidth}`} />
        </CardHeader>
      )}
      {tableContent}
    </Card>
  );
}
