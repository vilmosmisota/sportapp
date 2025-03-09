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
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="hidden sm:flex items-center gap-1"
        >
          <CalendarDays className="h-4 w-4" />
          <span>Today</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onToday}
          className="sm:hidden"
        >
          <CalendarDays className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-1">
          <Button variant="outline" size="icon" onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
