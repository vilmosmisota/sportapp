"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  type Table as TableType,
  flexRender,
} from "@tanstack/react-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DataTableProps<TData> {
  table: TableType<TData>;
  columns: ColumnDef<TData>[];
  data: TData[];
  rowClassName?: string;
}

export function DataTable<TData>({
  table,
  columns,
  data,
  rowClassName,
}: DataTableProps<TData>) {
  return (
    <div className="w-[calc(100vw-2rem)] md:w-full">
      <ScrollArea className="rounded-md border">
        <div className="relative">
          <Table className="bg-white">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-secondary/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`p-4 text-sm whitespace-nowrap ${
                        header.column.getIsPinned()
                          ? `sticky ${
                              header.column.getIsPinned() === "left"
                                ? "left-0"
                                : "right-0"
                            } z-20 bg-secondary/50`
                          : ""
                      }`}
                      style={{
                        minWidth: header.column.columnDef.minSize,
                        width: header.column.columnDef.size,
                        maxWidth: header.column.columnDef.maxSize,
                        left:
                          header.column.getIsPinned() === "left"
                            ? `${header.column.getStart("left")}px`
                            : undefined,
                        right:
                          header.column.getIsPinned() === "right"
                            ? `${header.column.getAfter("right")}px`
                            : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="bg-white">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={rowClassName}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`p-4 text-sm ${
                          cell.column.getIsPinned()
                            ? `sticky ${
                                cell.column.getIsPinned() === "left"
                                  ? "left-0"
                                  : "right-0"
                              } z-10 bg-white group-hover/row:bg-muted/50`
                            : ""
                        }`}
                        style={{
                          minWidth: cell.column.columnDef.minSize,
                          width: cell.column.columnDef.size,
                          maxWidth: cell.column.columnDef.maxSize,
                          left:
                            cell.column.getIsPinned() === "left"
                              ? `${cell.column.getStart("left")}px`
                              : undefined,
                          right:
                            cell.column.getIsPinned() === "right"
                              ? `${cell.column.getAfter("right")}px`
                              : undefined,
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
