import React, { useState, useEffect } from "react";
import { format, addHours, isValid, isBefore, parse } from "date-fns";
import { Calendar as CalendarIcon, Clock, ChevronDown, X } from "lucide-react";
import { cn } from "@/libs/tailwind/utils";
import { Alert, AlertDescription } from "../alert";
import { Button } from "../button";
import { Skeleton } from "../skeleton";
import { Calendar as CalendarComponent } from "../calendar";
import { Label } from "../label";
import { Input } from "../input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

export interface DateTimeRangeProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  error?: string;
  showDuration?: boolean;
  presetRanges?: { label: string; start: Date; end: Date }[];
}

export function DateTimeRange({
  startDate = new Date(),
  endDate = addHours(new Date(), 1),
  onStartDateChange,
  onEndDateChange,
  disabled = false,
  isLoading = false,
  className,
  error,
  showDuration = false,
  presetRanges,
}: DateTimeRangeProps) {
  const [localStartDate, setLocalStartDate] = useState<Date | undefined>(
    startDate
  );
  const [localEndDate, setLocalEndDate] = useState<Date | undefined>(endDate);
  const [validationError, setValidationError] = useState<string | undefined>(
    error
  );

  // State for accordion open status
  const [accordionValue, setAccordionValue] = useState<string | undefined>(
    undefined
  );

  // State for date picker
  const [startPickerMonth, setStartPickerMonth] = useState<Date>(
    startDate || new Date()
  );
  const [endPickerMonth, setEndPickerMonth] = useState<Date>(
    endDate || new Date()
  );

  // State for time picker
  const [startPickerTime, setStartPickerTime] = useState<string>(
    format(startDate || new Date(), "HH:mm")
  );
  const [endPickerTime, setEndPickerTime] = useState<string>(
    format(endDate || addHours(new Date(), 1), "HH:mm")
  );

  // Update local state when props change
  useEffect(() => {
    if (startDate) {
      setLocalStartDate(startDate);
      setStartPickerMonth(startDate);
      setStartPickerTime(format(startDate, "HH:mm"));
    }
    if (endDate) {
      setLocalEndDate(endDate);
      setEndPickerMonth(endDate);
      setEndPickerTime(format(endDate, "HH:mm"));
    }
  }, [startDate, endDate]);

  // Validate dates
  useEffect(() => {
    if (localStartDate && localEndDate) {
      if (isBefore(localEndDate, localStartDate)) {
        setValidationError("End date/time cannot be before start date/time");
      } else {
        setValidationError(undefined);
      }
    } else {
      setValidationError(error);
    }
  }, [localStartDate, localEndDate, error]);

  // Handle calendar selection
  const handleStartCalendarSelect = (date: Date | undefined) => {
    if (date && localStartDate) {
      // Keep the same time
      const [hours, minutes] = startPickerTime.split(":").map(Number);
      date.setHours(hours, minutes);

      setLocalStartDate(date);
      onStartDateChange?.(date);
    }
  };

  const handleEndCalendarSelect = (date: Date | undefined) => {
    if (date && localEndDate) {
      // Keep the same time
      const [hours, minutes] = endPickerTime.split(":").map(Number);
      date.setHours(hours, minutes);

      setLocalEndDate(date);
      onEndDateChange?.(date);
    }
  };

  // Handle time changes
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    setStartPickerTime(timeValue);

    if (localStartDate) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const newDate = new Date(localStartDate);
        newDate.setHours(hours, minutes);
        setLocalStartDate(newDate);
        onStartDateChange?.(newDate);
      }
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    setEndPickerTime(timeValue);

    if (localEndDate) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const newDate = new Date(localEndDate);
        newDate.setHours(hours, minutes);
        setLocalEndDate(newDate);
        onEndDateChange?.(newDate);
      }
    }
  };

  // Handle accordion toggle
  const toggleStartAccordion = () => {
    if (disabled) return;
    setAccordionValue(
      accordionValue === "start-date" ? undefined : "start-date"
    );
  };

  const toggleEndAccordion = () => {
    if (disabled) return;
    setAccordionValue(accordionValue === "end-date" ? undefined : "end-date");
  };

  // Handle accordion change
  const handleAccordionChange = (value: string) => {
    setAccordionValue(value);
  };

  // Apply preset range
  const applyPresetRange = (start: Date, end: Date) => {
    setLocalStartDate(start);
    setLocalEndDate(end);
    setStartPickerMonth(start);
    setEndPickerMonth(end);
    setStartPickerTime(format(start, "HH:mm"));
    setEndPickerTime(format(end, "HH:mm"));
    onStartDateChange?.(start);
    onEndDateChange?.(end);
  };

  // Clear dates
  const clearDates = () => {
    setLocalStartDate(undefined);
    setLocalEndDate(undefined);
    setStartPickerTime("");
    setEndPickerTime("");
    onStartDateChange?.(undefined);
    onEndDateChange?.(undefined);
  };

  // Calculate duration
  const getDuration = () => {
    if (!localStartDate || !localEndDate) return "";

    const diff = Math.abs(localEndDate.getTime() - localStartDate.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)} data-testid="datetime-range">
      {/* Start Date/Time Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="start-date" className="text-sm font-medium">
            Start
          </Label>
          {showDuration && localStartDate && localEndDate && (
            <span className="text-xs text-muted-foreground">
              Duration: {getDuration()}
            </span>
          )}
        </div>

        <Accordion
          type="single"
          collapsible
          value={accordionValue}
          onValueChange={handleAccordionChange}
          className="border-0"
        >
          <AccordionItem value="start-date" className="border-0">
            <div onClick={toggleStartAccordion} className="relative">
              <div
                className={cn(
                  "group flex items-center justify-between h-10 w-full px-3 py-2 bg-background text-sm rounded-md border border-input",
                  validationError && "border-red-500",
                  disabled && "opacity-50 cursor-not-allowed",
                  !disabled && "cursor-pointer hover:border-primary"
                )}
              >
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={!localStartDate ? "text-muted-foreground" : ""}
                  >
                    {localStartDate
                      ? format(localStartDate, "dd MMM yyyy")
                      : "Pick a date"}
                  </span>
                  {localStartDate && (
                    <>
                      <span className="text-muted-foreground mx-1">at</span>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{format(localStartDate, "HH:mm")}</span>
                    </>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    accordionValue === "start-date" && "transform rotate-180"
                  )}
                />
              </div>
              <AccordionTrigger className="hidden" />
            </div>
            <AccordionContent className="pt-3">
              <div className="rounded-md border bg-card shadow-sm">
                <div className="p-4 pb-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Select
                      value={startPickerMonth.getFullYear().toString()}
                      onValueChange={(year) => {
                        const newDate = new Date(startPickerMonth);
                        newDate.setFullYear(parseInt(year));
                        setStartPickerMonth(newDate);
                      }}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          {
                            length: new Date().getFullYear() + 5 - 1940 + 1,
                          },
                          (_, i) => (
                            <SelectItem
                              key={new Date().getFullYear() + 5 - i}
                              value={(
                                new Date().getFullYear() +
                                5 -
                                i
                              ).toString()}
                            >
                              {new Date().getFullYear() + 5 - i}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>

                    <Select
                      value={startPickerMonth.getMonth().toString()}
                      onValueChange={(monthStr) => {
                        const newDate = new Date(startPickerMonth);
                        newDate.setMonth(parseInt(monthStr));
                        setStartPickerMonth(newDate);
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
                </div>

                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-7 gap-4">
                  <div className="md:col-span-5">
                    <CalendarComponent
                      mode="single"
                      selected={localStartDate}
                      onSelect={handleStartCalendarSelect}
                      month={startPickerMonth}
                      onMonthChange={setStartPickerMonth}
                      className="rounded"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col justify-start md:border-l md:pl-4">
                    <div className="mb-4">
                      <Label
                        htmlFor="start-time-picker"
                        className="text-sm font-medium block mb-2"
                      >
                        Time
                      </Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <input
                          id="start-time-picker"
                          type="time"
                          value={startPickerTime}
                          onChange={handleStartTimeChange}
                          className={cn(
                            "flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          )}
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* End Date/Time Row */}
      <div className="space-y-2">
        <Label htmlFor="end-date" className="text-sm font-medium">
          End
        </Label>

        <Accordion
          type="single"
          collapsible
          value={accordionValue}
          onValueChange={handleAccordionChange}
          className="border-0"
        >
          <AccordionItem value="end-date" className="border-0">
            <div onClick={toggleEndAccordion} className="relative">
              <div
                className={cn(
                  "group flex items-center justify-between h-10 w-full px-3 py-2 bg-background text-sm rounded-md border border-input",
                  validationError && "border-red-500",
                  disabled && "opacity-50 cursor-not-allowed",
                  !disabled && "cursor-pointer hover:border-primary"
                )}
              >
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={!localEndDate ? "text-muted-foreground" : ""}
                  >
                    {localEndDate
                      ? format(localEndDate, "dd MMM yyyy")
                      : "Pick a date"}
                  </span>
                  {localEndDate && (
                    <>
                      <span className="text-muted-foreground mx-1">at</span>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{format(localEndDate, "HH:mm")}</span>
                    </>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    accordionValue === "end-date" && "transform rotate-180"
                  )}
                />
              </div>
              <AccordionTrigger className="hidden" />
            </div>
            <AccordionContent className="pt-3">
              <div className="rounded-md border bg-card shadow-sm">
                <div className="p-4 pb-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Select
                      value={endPickerMonth.getFullYear().toString()}
                      onValueChange={(year) => {
                        const newDate = new Date(endPickerMonth);
                        newDate.setFullYear(parseInt(year));
                        setEndPickerMonth(newDate);
                      }}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          {
                            length: new Date().getFullYear() + 5 - 1940 + 1,
                          },
                          (_, i) => (
                            <SelectItem
                              key={new Date().getFullYear() + 5 - i}
                              value={(
                                new Date().getFullYear() +
                                5 -
                                i
                              ).toString()}
                            >
                              {new Date().getFullYear() + 5 - i}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>

                    <Select
                      value={endPickerMonth.getMonth().toString()}
                      onValueChange={(monthStr) => {
                        const newDate = new Date(endPickerMonth);
                        newDate.setMonth(parseInt(monthStr));
                        setEndPickerMonth(newDate);
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
                </div>

                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-7 gap-4">
                  <div className="md:col-span-5">
                    <CalendarComponent
                      mode="single"
                      selected={localEndDate}
                      onSelect={handleEndCalendarSelect}
                      month={endPickerMonth}
                      onMonthChange={setEndPickerMonth}
                      className="rounded"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col justify-start md:border-l md:pl-4">
                    <div className="mb-4">
                      <Label
                        htmlFor="end-time-picker"
                        className="text-sm font-medium block mb-2"
                      >
                        Time
                      </Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <input
                          id="end-time-picker"
                          type="time"
                          value={endPickerTime}
                          onChange={handleEndTimeChange}
                          className={cn(
                            "flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          )}
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Validation Error Message */}
      {validationError && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {/* Preset Ranges */}
      {presetRanges && presetRanges.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex flex-wrap gap-2">
            {presetRanges.map((preset, index) => (
              <Button
                key={index}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => applyPresetRange(preset.start, preset.end)}
                disabled={disabled}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
