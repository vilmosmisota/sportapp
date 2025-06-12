"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Season } from "@/entities/season/Season.schema";
import { cn } from "@/lib/utils";
import * as React from "react";

interface SeasonSelectorProps {
  seasons?: Season[];
  selectedSeason?: Season | null;
  onSeasonChange?: (seasonId: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  width?: string;
  disabled?: boolean;
}

export const SeasonSelector = React.forwardRef<
  React.ElementRef<typeof Select>,
  SeasonSelectorProps
>(
  (
    {
      seasons = [],
      selectedSeason,
      onSeasonChange,
      isLoading = false,
      placeholder = "Select season",
      className,
      width = "w-[180px]",
      disabled = false,
    },
    ref
  ) => {
    // Show skeleton while loading
    if (isLoading) {
      return <Skeleton className={cn("h-10", width)} />;
    }

    // Don't render if no seasons available
    if (!seasons || seasons.length === 0) {
      return null;
    }

    return (
      <Select
        value={selectedSeason?.id.toString()}
        onValueChange={onSeasonChange}
        disabled={disabled}
      >
        <SelectTrigger className={cn(width, className)} ref={ref}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {seasons.map((season) => (
            <SelectItem key={season.id} value={season.id.toString()}>
              {season.customName || `Season ${season.id}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

SeasonSelector.displayName = "SeasonSelector";
