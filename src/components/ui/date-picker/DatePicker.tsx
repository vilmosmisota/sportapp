"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/libs/tailwind/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  fromDate?: Date;
  toDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  fromDate,
  toDate,
}: DatePickerProps) {
  const [month, setMonth] = React.useState<Date>(value || new Date());

  // Update month when value changes externally
  React.useEffect(() => {
    if (value) {
      setMonth(value);
    }
  }, [value]);

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full pl-3 text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {value ? format(value, "PPP") : <span>Pick a date</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-3"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Select
              value={month.getFullYear().toString()}
              onValueChange={(year) => {
                const newDate = new Date(month);
                newDate.setFullYear(parseInt(year));
                setMonth(newDate);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: new Date().getFullYear() - 1940 + 1 },
                  (_, i) => (
                    <SelectItem
                      key={new Date().getFullYear() - i}
                      value={(new Date().getFullYear() - i).toString()}
                    >
                      {new Date().getFullYear() - i}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Select
              value={month.getMonth().toString()}
              onValueChange={(monthStr) => {
                const newDate = new Date(month);
                newDate.setMonth(parseInt(monthStr));
                setMonth(newDate);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {format(new Date(2000, i, 1), "MMMM")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={(date) =>
              Boolean(
                (fromDate && date < fromDate) || (toDate && date > toDate)
              )
            }
            month={month}
            onMonthChange={setMonth}
            className="rounded-md border"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
