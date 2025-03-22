import React, { useState, useEffect } from "react";
import { Input } from "../input";
import { Button } from "../button";
import { Calendar } from "lucide-react";
import { format, isValid, parse } from "date-fns";
import { DatePicker } from "../date-picker/DatePicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/libs/tailwind/utils";

interface DateInputProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  error?: boolean;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}

export function DateInput({
  value,
  onChange,
  error,
  className,
  disabled,
  required,
  name,
}: DateInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  // Update input value when date prop changes
  useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, "dd/MM/yyyy"));
    } else {
      setInputValue("");
    }
  }, [value]);

  const formatDateString = (input: string) => {
    // If user types '/' at the correct positions (3rd or 6th index), keep it
    if ((input.length === 3 || input.length === 6) && input.endsWith("/")) {
      return input;
    }

    // Remove any non-digit characters
    const digits = input.replace(/\D/g, "");

    // Add slashes automatically
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateString(e.target.value);
    setInputValue(formatted);

    // Try to parse the date if we have a complete format
    if (formatted.length === 10) {
      const parsedDate = parse(formatted, "dd/MM/yyyy", new Date());
      if (isValid(parsedDate)) {
        onChange?.(parsedDate);
      }
    }
  };

  const handleDatePickerChange = (date: Date | undefined) => {
    onChange?.(date);
    setShowPicker(false);
  };

  const handleCalendarButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPicker(!showPicker);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="DD/MM/YYYY"
          className={cn(
            "pr-10",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          disabled={disabled}
          required={required}
          name={name}
        />
        <Popover open={showPicker} onOpenChange={setShowPicker}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCalendarButtonClick}
              className={cn(
                "absolute right-0 top-0 h-full px-2 py-2 hover:bg-transparent",
                error && "text-red-500 hover:text-red-500"
              )}
              disabled={disabled}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <DatePicker value={value} onChange={handleDatePickerChange} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
