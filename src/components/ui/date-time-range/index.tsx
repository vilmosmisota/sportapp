import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  format,
  addHours,
  addMinutes,
  isValid,
  isBefore,
  parse,
  isAfter,
  isSameDay,
} from "date-fns";
import { Calendar as CalendarIcon, Clock, ChevronDown, X } from "lucide-react";
import { cn } from "@/libs/tailwind/utils";
import { Alert, AlertDescription } from "../alert";
import { Button } from "../button";
import { Skeleton } from "../skeleton";
import { Calendar as CalendarComponent } from "../calendar";
import { Label } from "../label";
import { Input } from "../input";
import { Switch } from "../switch";
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

import {
  calculateDuration,
  createDateWithTime,
  createNextDayDate,
} from "./utils";

type DurationPreset = {
  label: string;
  minutes: number;
};

const DURATION_PRESETS: DurationPreset[] = [
  { label: "30m", minutes: 30 },
  { label: "1h", minutes: 60 },
  { label: "1.5h", minutes: 90 },
  { label: "2h", minutes: 120 },
];

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
  defaultIsMultiDay?: boolean;
}

type AccordionValueType = string | string[];

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
  defaultIsMultiDay = false,
}: DateTimeRangeProps) {
  const isInternalChange = useRef(false);

  const [localStartDate, setLocalStartDate] = useState<Date | undefined>(
    startDate
  );
  const [localEndDate, setLocalEndDate] = useState<Date | undefined>(endDate);
  const [isMultiDay, setIsMultiDay] = useState<boolean>(
    defaultIsMultiDay ||
      (startDate && endDate && !isSameDay(startDate, endDate))
  );

  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [singleAccordionValue, setSingleAccordionValue] =
    useState<string>("start-date");
  const [multiAccordionValue, setMultiAccordionValue] = useState<string[]>([
    "start-date",
    "end-date",
  ]);

  const [startPickerMonth, setStartPickerMonth] = useState<Date>(
    startDate || new Date()
  );
  const [endPickerMonth, setEndPickerMonth] = useState<Date>(
    endDate || new Date()
  );
  const [startPickerTime, setStartPickerTime] = useState<string>(
    format(startDate || new Date(), "HH:mm")
  );
  const [endPickerTime, setEndPickerTime] = useState<string>(
    format(endDate || addHours(new Date(), 1), "HH:mm")
  );

  useEffect(() => {
    if (isInternalChange.current) {
      return;
    }

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

    if (startDate && endDate && !isSameDay(startDate, endDate)) {
      setIsMultiDay(true);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    // Update accordion value when multi-day mode changes
    setMultiAccordionValue(
      isMultiDay ? ["start-date", "end-date"] : ["start-date"]
    );
  }, [isMultiDay]);

  const validationError = useMemo(() => {
    if (localStartDate && localEndDate) {
      if (isMultiDay) {
        if (isBefore(localEndDate, localStartDate)) {
          return "End date/time cannot be before start date/time";
        }
      } else {
        const startTime = new Date(localStartDate);
        const endTime = new Date(localEndDate);

        if (
          endTime.getHours() < startTime.getHours() ||
          (endTime.getHours() === startTime.getHours() &&
            endTime.getMinutes() < startTime.getMinutes())
        ) {
          return "End time cannot be before start time";
        }
      }
    }
    return error;
  }, [localStartDate, localEndDate, isMultiDay, error]);

  useEffect(() => {
    if (localStartDate && localEndDate) {
      const diff = Math.abs(localEndDate.getTime() - localStartDate.getTime());
      const minutes = Math.floor(diff / (1000 * 60));

      const matchedPreset = DURATION_PRESETS.find(
        (preset) => preset.minutes === minutes
      );

      if (selectedDuration !== (matchedPreset ? matchedPreset.label : null)) {
        setSelectedDuration(matchedPreset ? matchedPreset.label : null);
      }
    }
  }, [localStartDate, localEndDate, selectedDuration]);

  const duration = useMemo(() => {
    if (!localStartDate || !localEndDate) return "";
    return calculateDuration(localStartDate, localEndDate);
  }, [localStartDate, localEndDate]);

  const handleStartCalendarSelect = (date: Date | undefined) => {
    if (date && localStartDate) {
      isInternalChange.current = true;

      const newDate = createDateWithTime(date, startPickerTime);
      setLocalStartDate(newDate);
      onStartDateChange?.(newDate);

      if (!isMultiDay && localEndDate) {
        const endDate = createDateWithTime(newDate, endPickerTime);

        if (isAfter(endDate, newDate)) {
          setLocalEndDate(endDate);
          onEndDateChange?.(endDate);
        } else {
          const adjustedEndDate = addHours(new Date(newDate), 1);
          setLocalEndDate(adjustedEndDate);
          setEndPickerTime(format(adjustedEndDate, "HH:mm"));
          onEndDateChange?.(adjustedEndDate);
        }
      } else if (isMultiDay && localEndDate) {
        if (
          isAfter(newDate, localEndDate) ||
          isSameDay(newDate, localEndDate)
        ) {
          const nextDay = createNextDayDate(newDate);
          nextDay.setHours(localEndDate.getHours(), localEndDate.getMinutes());

          setLocalEndDate(nextDay);
          setEndPickerMonth(nextDay);
          onEndDateChange?.(nextDay);
        }
      }
      setTimeout(() => {
        isInternalChange.current = false;
      }, 100);
    }
  };

  const handleEndCalendarSelect = (date: Date | undefined) => {
    if (date && localEndDate) {
      isInternalChange.current = true;

      const newDate = createDateWithTime(date, endPickerTime);

      setLocalEndDate(newDate);
      onEndDateChange?.(newDate);

      setTimeout(() => {
        isInternalChange.current = false;
      }, 100);
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    setStartPickerTime(timeValue);

    if (localStartDate) {
      isInternalChange.current = true;

      const newDate = createDateWithTime(localStartDate, timeValue);
      setLocalStartDate(newDate);
      onStartDateChange?.(newDate);

      if (!isMultiDay && localEndDate) {
        const endTime = new Date(localEndDate);
        if (isBefore(endTime, newDate)) {
          const adjustedEndDate = addHours(new Date(newDate), 1);
          setLocalEndDate(adjustedEndDate);
          setEndPickerTime(format(adjustedEndDate, "HH:mm"));
          onEndDateChange?.(adjustedEndDate);
        }
      }

      setTimeout(() => {
        isInternalChange.current = false;
      }, 100);
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    setEndPickerTime(timeValue);

    if (localEndDate) {
      isInternalChange.current = true;

      const newDate = createDateWithTime(localEndDate, timeValue);

      if (!isMultiDay && localStartDate) {
        newDate.setFullYear(
          localStartDate.getFullYear(),
          localStartDate.getMonth(),
          localStartDate.getDate()
        );
      }

      setLocalEndDate(newDate);
      onEndDateChange?.(newDate);

      setTimeout(() => {
        isInternalChange.current = false;
      }, 100);
    }
  };

  const handleAccordionChange = (value: AccordionValueType) => {
    if (value === undefined) {
      setMultiAccordionValue(
        isMultiDay ? ["start-date", "end-date"] : ["start-date"]
      );
    } else {
      setMultiAccordionValue(value as string[]);
    }
  };

  const toggleStartAccordion = () => {
    if (disabled) return;
    if (isMultiDay) {
      // For multi-day mode, handle array of values
      setMultiAccordionValue((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        const hasValue = prevArray.includes("start-date");
        return hasValue
          ? prevArray.filter((v) => v !== "start-date")
          : [...prevArray, "start-date"];
      });
    } else {
      // For single day mode, handle single value
      setSingleAccordionValue(
        singleAccordionValue === "start-date" ? "" : "start-date"
      );
    }
  };

  const toggleEndAccordion = () => {
    if (disabled) return;
    if (isMultiDay) {
      // For multi-day mode, handle array of values
      setMultiAccordionValue((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        const hasValue = prevArray.includes("end-date");
        return hasValue
          ? prevArray.filter((v) => v !== "end-date")
          : [...prevArray, "end-date"];
      });
    } else {
      // For single day mode, handle single value
      setSingleAccordionValue(
        singleAccordionValue === "end-date" ? "" : "end-date"
      );
    }
  };

  // ===== Preset Handlers =====

  const applyPresetRange = (start: Date, end: Date) => {
    isInternalChange.current = true;

    setLocalStartDate(start);
    setLocalEndDate(end);
    setStartPickerMonth(start);
    setEndPickerMonth(end);
    setStartPickerTime(format(start, "HH:mm"));
    setEndPickerTime(format(end, "HH:mm"));
    onStartDateChange?.(start);
    onEndDateChange?.(end);

    setIsMultiDay(!isSameDay(start, end));

    setTimeout(() => {
      isInternalChange.current = false;
    }, 100);
  };

  const applyDurationPreset = (preset: DurationPreset) => {
    if (localStartDate) {
      isInternalChange.current = true;

      const newEndDate = addMinutes(new Date(localStartDate), preset.minutes);
      setLocalEndDate(newEndDate);
      setEndPickerTime(format(newEndDate, "HH:mm"));
      onEndDateChange?.(newEndDate);
      setSelectedDuration(preset.label);

      // Reset the flag after a short delay
      setTimeout(() => {
        isInternalChange.current = false;
      }, 100);
    }
  };

  // ===== Multi-day Mode Handler =====

  const handleMultiDayToggle = (checked: boolean) => {
    setIsMultiDay(checked);

    isInternalChange.current = true;

    if (!checked && localStartDate && localEndDate) {
      const endDate = createDateWithTime(localStartDate, endPickerTime);

      if (isBefore(endDate, localStartDate)) {
        const adjustedEndDate = addHours(new Date(localStartDate), 1);
        setLocalEndDate(adjustedEndDate);
        setEndPickerTime(format(adjustedEndDate, "HH:mm"));
        onEndDateChange?.(adjustedEndDate);
      } else {
        setLocalEndDate(endDate);
        onEndDateChange?.(endDate);
      }
    } else if (checked && localStartDate) {
      const nextDay = createNextDayDate(localStartDate);
      const formattedTime = format(nextDay, "HH:mm");

      setLocalEndDate(nextDay);
      setEndPickerMonth(nextDay);
      setEndPickerTime(formattedTime);
      onEndDateChange?.(nextDay);

      if (multiAccordionValue.includes("end-date")) {
        setMultiAccordionValue(
          multiAccordionValue.filter((v) => v !== "end-date")
        );
        setTimeout(() => setMultiAccordionValue(["end-date"]), 0);
      }
    }

    setTimeout(() => {
      isInternalChange.current = false;
    }, 100);
  };

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
    <div className={cn("space-y-4", className)} data-testid="datetime-range">
      {/* Start Date/Time Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="start-date" className="text-sm font-medium">
            Start
          </Label>
          {showDuration && localStartDate && localEndDate && (
            <span className="text-xs text-muted-foreground">
              Duration: {duration}
            </span>
          )}
        </div>

        {isMultiDay ? (
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

                      {/* Multi-day Toggle - moved inside calendar header */}
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="multi-day-toggle"
                          className="text-sm font-medium cursor-pointer whitespace-nowrap"
                        >
                          Multi-day event
                        </Label>
                        <Switch
                          id="multi-day-toggle"
                          checked={isMultiDay}
                          onCheckedChange={handleMultiDayToggle}
                          disabled={disabled}
                        />
                      </div>
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
                      {/* Start Time Input */}
                      <div className="mb-4">
                        <Label
                          htmlFor="start-time-picker"
                          className="text-sm font-medium block mb-2"
                        >
                          Start Time
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

                      {/* End Time Input for Single Day Events */}
                      {!isMultiDay && (
                        <div className="mb-4">
                          <Label
                            htmlFor="end-time-picker-single"
                            className="text-sm font-medium block mb-2"
                          >
                            End Time
                          </Label>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <input
                              id="end-time-picker-single"
                              type="time"
                              value={endPickerTime}
                              onChange={handleEndTimeChange}
                              className={cn(
                                "flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                validationError && "border-red-500"
                              )}
                              disabled={disabled}
                            />
                          </div>
                        </div>
                      )}

                      {/* Duration presets for single-day events */}
                      {!isMultiDay && (
                        <div className="mt-2">
                          <Label className="text-sm font-medium block mb-2">
                            Duration
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {DURATION_PRESETS.map((preset) => (
                              <Button
                                type="button"
                                key={preset.label}
                                size="sm"
                                variant={
                                  selectedDuration === preset.label
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => applyDurationPreset(preset)}
                                disabled={disabled || !localStartDate}
                                className="flex-1 min-w-[60px]"
                              >
                                {preset.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <Accordion
            type="single"
            value={singleAccordionValue}
            onValueChange={setSingleAccordionValue}
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
                      singleAccordionValue === "start-date" &&
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

                      {/* Multi-day Toggle - moved inside calendar header */}
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="multi-day-toggle"
                          className="text-sm font-medium cursor-pointer whitespace-nowrap"
                        >
                          Multi-day event
                        </Label>
                        <Switch
                          id="multi-day-toggle"
                          checked={isMultiDay}
                          onCheckedChange={handleMultiDayToggle}
                          disabled={disabled}
                        />
                      </div>
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
                      {/* Start Time Input */}
                      <div className="mb-4">
                        <Label
                          htmlFor="start-time-picker"
                          className="text-sm font-medium block mb-2"
                        >
                          Start Time
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

                      {/* End Time Input for Single Day Events */}
                      {!isMultiDay && (
                        <div className="mb-4">
                          <Label
                            htmlFor="end-time-picker-single"
                            className="text-sm font-medium block mb-2"
                          >
                            End Time
                          </Label>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <input
                              id="end-time-picker-single"
                              type="time"
                              value={endPickerTime}
                              onChange={handleEndTimeChange}
                              className={cn(
                                "flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                validationError && "border-red-500"
                              )}
                              disabled={disabled}
                            />
                          </div>
                        </div>
                      )}

                      {/* Duration presets for single-day events */}
                      {!isMultiDay && (
                        <div className="mt-2">
                          <Label className="text-sm font-medium block mb-2">
                            Duration
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {DURATION_PRESETS.map((preset) => (
                              <Button
                                type="button"
                                key={preset.label}
                                size="sm"
                                variant={
                                  selectedDuration === preset.label
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => applyDurationPreset(preset)}
                                disabled={disabled || !localStartDate}
                                className="flex-1 min-w-[60px]"
                              >
                                {preset.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>

      {/* End Date/Time Row - Only shown for multi-day events */}
      {isMultiDay && (
        <div className="space-y-2">
          <Label htmlFor="end-date" className="text-sm font-medium">
            End
          </Label>

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

                  <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-7 gap-4">
                    <div className="md:col-span-5">
                      <CalendarComponent
                        mode="single"
                        selected={localEndDate}
                        onSelect={handleEndCalendarSelect}
                        month={endPickerMonth}
                        onMonthChange={setEndPickerMonth}
                        className="rounded"
                        fromDate={
                          isMultiDay && localStartDate
                            ? localStartDate
                            : undefined
                        }
                        disabled={disabled}
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
      )}

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
