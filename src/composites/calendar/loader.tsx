"use client";

import { cn } from "@/libs/tailwind/utils";

interface CalendarLoaderProps {
  className?: string;
}

export function CalendarLoader({ className }: CalendarLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card border border-border rounded-lg shadow-sm animate-pulse",
        className
      )}
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
        {/* Left side - Navigation buttons */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-muted rounded-md"></div>
          <div className="h-8 w-8 bg-muted rounded-md"></div>
          <div className="h-8 w-16 bg-muted rounded-md ml-2"></div>
        </div>

        {/* Center - Title */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-muted rounded"></div>
          <div className="h-6 w-32 bg-muted rounded"></div>
        </div>

        {/* Right side - View switcher */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border">
          <div className="h-7 w-12 bg-muted rounded"></div>
          <div className="h-7 w-12 bg-muted rounded"></div>
          <div className="h-7 w-12 bg-muted rounded"></div>
        </div>
      </div>

      {/* Calendar grid skeleton */}
      <div className="flex flex-col flex-1">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="p-3 text-center border-r border-border last:border-r-0"
            >
              <div className="h-4 w-8 bg-muted rounded mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 flex-1">
          {Array.from({ length: 35 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "border-r border-b border-border p-2 min-h-[120px] bg-card",
                index % 7 === 6 && "border-r-0"
              )}
            >
              {/* Day number skeleton */}
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-4 bg-muted rounded"></div>
              </div>

              {/* Event skeletons */}
              <div className="space-y-1">
                {/* Randomly show 0-3 event skeletons per day */}
                {Array.from({
                  length: Math.floor(Math.random() * 4),
                }).map((_, eventIndex) => (
                  <div
                    key={eventIndex}
                    className="h-5 bg-muted/60 rounded border-l-4 border-muted"
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Alternative compact loader for smaller spaces
export function CalendarLoaderCompact({ className }: CalendarLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card border border-border rounded-lg shadow-sm animate-pulse",
        className
      )}
    >
      {/* Simplified header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="h-6 w-24 bg-muted rounded"></div>
        <div className="h-6 w-32 bg-muted rounded"></div>
        <div className="h-6 w-20 bg-muted rounded"></div>
      </div>

      {/* Simplified grid */}
      <div className="flex-1 p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-16 bg-muted/40 rounded border"
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
