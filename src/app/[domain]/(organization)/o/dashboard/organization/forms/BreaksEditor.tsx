import React, { useState, Dispatch, SetStateAction } from "react";
import { format, addDays, isAfter, isBefore } from "date-fns";
import { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Plus, Edit2, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Break = {
  id: number;
  from: Date;
  to: Date;
};

type BreaksEditorProps = {
  breaks: Break[];
  onUpdate: Dispatch<SetStateAction<Break[]>>;
  minDate?: number | Date;
  maxDate?: number | Date;
  disabledDates?: Date[];
};

const BreaksEditor = ({
  breaks,
  onUpdate,
  minDate,
  maxDate,
  disabledDates = [],
}: BreaksEditorProps) => {
  const [selectedBreak, setSelectedBreak] = useState<Break | null>(null);

  const normalizedMinDate =
    minDate instanceof Date ? minDate : minDate ? new Date(minDate) : undefined;
  const normalizedMaxDate =
    maxDate instanceof Date ? maxDate : maxDate ? new Date(maxDate) : undefined;

  const handleAddBreak = () => {
    const now = new Date();
    const newBreak: Break = {
      id: Date.now(),
      from: now,
      to: addDays(now, 1),
    };

    onUpdate((prevBreaks) => [...prevBreaks, newBreak]);
  };

  const handleRemoveBreak = (breakId: number) => {
    onUpdate((prevBreaks) => prevBreaks.filter((br) => br.id !== breakId));
  };

  const handleSelectDate = (
    breakId: number,
    dateRange: DateRange | undefined
  ) => {
    if (!dateRange?.from || !dateRange?.to) return;

    onUpdate((prevBreaks) =>
      prevBreaks.map((br) => {
        if (br.id === breakId) {
          return {
            ...br,
            from: dateRange.from ?? new Date(),
            to: dateRange.to ?? new Date(),
          };
        }
        return br;
      })
    );
    setSelectedBreak(null);
  };

  const handleEditBreak = (br: Break) => {
    setSelectedBreak(br);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Season Breaks</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddBreak}
            className="gap-2"
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add Break
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date Range</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breaks.map((br) => (
              <TableRow key={br.id}>
                <TableCell>
                  <span className="font-medium">
                    {format(br.from, "dd LLL y")} - {format(br.to, "dd LLL y")}
                  </span>
                </TableCell>
                <TableCell>
                  {Math.ceil(
                    (br.to.getTime() - br.from.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditBreak(br)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="range"
                        defaultMonth={br.from}
                        selected={{ from: br.from, to: br.to }}
                        onSelect={(dateRange) =>
                          handleSelectDate(br.id, dateRange)
                        }
                        numberOfMonths={2}
                        fromDate={normalizedMinDate}
                        toDate={normalizedMaxDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBreak(br.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {breaks.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center h-24 text-muted-foreground"
                >
                  No breaks added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BreaksEditor;
