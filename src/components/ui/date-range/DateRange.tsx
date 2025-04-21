import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  format,
  addDays,
  isValid,
  isBefore,
  isSameDay,
  isAfter,
} from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/libs/tailwind/utils";
import { Alert, AlertDescription } from "../alert";
import { Button } from "../button";
import { Skeleton } from "../skeleton";
import { Calendar as CalendarComponent } from "../calendar";
import { Label } from "../label";
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

import { calculateDuration, createNextDayDate } from "./utils";

export interface DateRangeProps {
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
  horizontal?: boolean;
}

export function DateRange({
  startDate = new Date(),
  endDate = addDays(new Date(), 7),
  onStartDateChange,
  onEndDateChange,
  disabled = false,
  isLoading = false,
  className,
  error,
  showDuration = false,
  presetRanges,
  horizontal = false,
}: DateRangeProps) {
  // Refs to track internal state changes
  const isInternalChange = useRef(false);
  const isSyncingProps = useRef(false);

  // Store initial prop values to avoid unnecessary rerenders
  const initialPropsRef = useRef({
    startDate: startDate,
    endDate: endDate,
  });

  // Local state for the component
  const [localStartDate, setLocalStartDate] = useState<Date | undefined>(
    initialPropsRef.current.startDate
  );
  const [localEndDate, setLocalEndDate] = useState<Date | undefined>(
    initialPropsRef.current.endDate
  );

  const [multiAccordionValue, setMultiAccordionValue] = useState<string[]>([]);

  const [startPickerMonth, setStartPickerMonth] = useState<Date>(
    initialPropsRef.current.startDate || new Date()
  );
  const [endPickerMonth, setEndPickerMonth] = useState<Date>(
    initialPropsRef.current.endDate || addDays(new Date(), 7)
  );

  // Safely synchronize props to state only when they actually change
  useEffect(() => {
    // Skip update if we're in the middle of an internal change
    if (isInternalChange.current || isSyncingProps.current) {
      return;
    }

    // Use a function to compare dates safely
    const datesAreDifferent = (date1?: Date, date2?: Date) => {
      if (!date1 && !date2) return false;
      if (!date1 || !date2) return true;
      return date1.getTime() !== date2.getTime();
    };

    const startDateChanged = datesAreDifferent(startDate, localStartDate);
    const endDateChanged = datesAreDifferent(endDate, localEndDate);

    // Only update if dates have actually changed
    if (startDateChanged || endDateChanged) {
      isSyncingProps.current = true;

      try {
        if (startDateChanged && startDate) {
          const newStartDate = new Date(startDate);
          setLocalStartDate(newStartDate);
          setStartPickerMonth(newStartDate);
        }

        if (endDateChanged && endDate) {
          const newEndDate = new Date(endDate);
          setLocalEndDate(newEndDate);
          setEndPickerMonth(newEndDate);
        }
      } finally {
        // Always reset the sync flag when done
        isSyncingProps.current = false;
      }
    }
  }, [startDate, endDate, localStartDate, localEndDate]);

  // Memoize validation error to prevent unnecessary recalculations
  const validationError = useMemo(() => {
    if (localStartDate && localEndDate) {
      if (isBefore(localEndDate, localStartDate)) {
        return "End date cannot be before start date";
      }
    }
    return error;
  }, [localStartDate, localEndDate, error]);

  // Memoize duration calculation to prevent unnecessary recalculations
  const duration = useMemo(() => {
    if (!localStartDate || !localEndDate) return "";
    return calculateDuration(localStartDate, localEndDate);
  }, [localStartDate, localEndDate]);

  // Handle start date selection - memoize to prevent recreating on every render
  const handleStartCalendarSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return;

      isInternalChange.current = true;
      try {
        // Create a new date object to avoid mutation issues
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);

        setLocalStartDate(newDate);

        // Only call the callback if it exists
        if (onStartDateChange) {
          onStartDateChange(newDate);
        }

        // If end date needs adjustment, update it
        if (
          localEndDate &&
          (isAfter(newDate, localEndDate) || isSameDay(newDate, localEndDate))
        ) {
          const nextDay = createNextDayDate(newDate);
          nextDay.setHours(0, 0, 0, 0);

          setLocalEndDate(nextDay);
          setEndPickerMonth(nextDay);

          // Only call the callback if it exists
          if (onEndDateChange) {
            onEndDateChange(nextDay);
          }
        }
      } finally {
        // Ensure we reset the flag even if there's an error
        setTimeout(() => {
          isInternalChange.current = false;
        }, 0);
      }
    },
    [localEndDate, onStartDateChange, onEndDateChange]
  );

  // Handle end date selection - memoize to prevent recreating on every render
  const handleEndCalendarSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return;

      isInternalChange.current = true;
      try {
        // Create a new date object to avoid mutation issues
        const newDate = new Date(date);
        newDate.setHours(23, 59, 59, 999);

        setLocalEndDate(newDate);

        // Only call the callback if it exists
        if (onEndDateChange) {
          onEndDateChange(newDate);
        }
      } finally {
        // Ensure we reset the flag even if there's an error
        setTimeout(() => {
          isInternalChange.current = false;
        }, 0);
      }
    },
    [onEndDateChange]
  );

  // Toggle accordion for start date
  const toggleStartAccordion = useCallback(() => {
    if (disabled) return;

    setMultiAccordionValue((prev) => {
      const prevArray = Array.isArray(prev) ? prev : [];
      const hasValue = prevArray.includes("start-date");
      return hasValue
        ? prevArray.filter((v) => v !== "start-date")
        : [...prevArray, "start-date"];
    });
  }, [disabled]);

  // Toggle accordion for end date
  const toggleEndAccordion = useCallback(() => {
    if (disabled) return;

    setMultiAccordionValue((prev) => {
      const prevArray = Array.isArray(prev) ? prev : [];
      const hasValue = prevArray.includes("end-date");
      return hasValue
        ? prevArray.filter((v) => v !== "end-date")
        : [...prevArray, "end-date"];
    });
  }, [disabled]);

  // ===== Rendering Logic =====

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
    <div className={cn("space-y-4", className)} data-testid="date-range">
      <div className={cn("flex flex-col gap-4", horizontal && "md:flex-row")}>
        {/* Start Date */}
        <div className={cn("space-y-2", horizontal && "md:flex-1")}>
          <div className="flex items-center justify-between">
            <Label htmlFor="start-date" className="text-sm font-medium">
              Start Date
            </Label>
            {showDuration && localStartDate && localEndDate && !horizontal && (
              <span className="text-xs text-muted-foreground">
                Duration: {duration}
              </span>
            )}
          </div>

          <Accordion
            type="multiple"
            value={multiAccordionValue}
            onValueChange={setMultiAccordionValue}
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
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      multiAccordionValue.includes("start-date") &&
                        "transform rotate-180"
                    )}
                  />
                </div>
                <AccordionTrigger className="hidden" />
              </div>
              <AccordionContent className="pt-3">
                <div className="rounded-md border bg-card shadow-sm">
                  <div className="p-4 pb-3">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
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
                  </div>

                  <div className="p-4 pt-0">
                    <CalendarComponent
                      mode="single"
                      selected={localStartDate}
                      onSelect={handleStartCalendarSelect}
                      month={startPickerMonth}
                      onMonthChange={setStartPickerMonth}
                      className="rounded"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* End Date */}
        <div className={cn("space-y-2", horizontal && "md:flex-1")}>
          <div className="flex items-center justify-between">
            <Label htmlFor="end-date" className="text-sm font-medium">
              End Date
            </Label>
            {showDuration && localStartDate && localEndDate && horizontal && (
              <span className="text-xs text-muted-foreground">
                Duration: {duration}
              </span>
            )}
          </div>

          <Accordion
            type="multiple"
            value={multiAccordionValue}
            onValueChange={setMultiAccordionValue}
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
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      multiAccordionValue.includes("end-date") &&
                        "transform rotate-180"
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

                  <div className="p-4 pt-0">
                    <CalendarComponent
                      mode="single"
                      selected={localEndDate}
                      onSelect={handleEndCalendarSelect}
                      month={endPickerMonth}
                      onMonthChange={setEndPickerMonth}
                      className="rounded"
                      fromDate={localStartDate}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Validation Error Message */}
      {validationError && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
