import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/libs/tailwind/utils";
import { SwipeDirection } from "./useSwipeGesture";
import { format, addMonths, subMonths } from "date-fns";

interface SwipeIndicatorProps {
  direction: SwipeDirection;
  isActive: boolean;
  currentMonth?: Date;
}

/**
 * An enhanced component that shows a visual indicator during swipe gestures
 * Includes text showing which month the user is swiping to
 */
export function SwipeIndicator({
  direction,
  isActive,
  currentMonth = new Date(),
}: SwipeIndicatorProps) {
  // Only show when active and has a direction
  if (!isActive || !direction) return null;

  const targetMonth =
    direction === "left"
      ? addMonths(currentMonth, 1)
      : subMonths(currentMonth, 1);

  const monthName = format(targetMonth, "MMMM yyyy");
  const actionText = direction === "left" ? "Next" : "Previous";

  return (
    <div
      className={cn(
        "fixed z-50 transform transition-opacity",
        "top-1/2 -translate-y-1/2",
        "bg-background/90 backdrop-blur-sm shadow-lg border",
        direction === "left"
          ? "right-2 md:right-4 rounded-l-full"
          : "left-2 md:left-4 rounded-r-full",
        "py-3 pl-4 pr-6 md:py-4 md:pl-5 md:pr-8",
        "flex items-center gap-2 md:gap-3"
      )}
    >
      {direction === "left" ? (
        <>
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">{actionText}</span>
            <span className="font-medium">{monthName}</span>
          </div>
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
        </>
      ) : (
        <>
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{actionText}</span>
            <span className="font-medium">{monthName}</span>
          </div>
        </>
      )}
    </div>
  );
}
