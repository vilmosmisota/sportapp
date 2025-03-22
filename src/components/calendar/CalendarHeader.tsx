"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { CalendarHeaderProps } from "./types";
import { Badge } from "@/components/ui/badge";

export function CalendarHeader({
  title,
  onPrevious,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-base font-medium">{title}</h2>

      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="h-7 text-xs px-2"
        >
          Today
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          className="h-7 w-7"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
