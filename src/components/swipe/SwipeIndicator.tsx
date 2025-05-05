import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/libs/tailwind/utils";
import { SwipeDirection } from "./useSwipeGesture";

interface SwipeIndicatorProps {
  direction: SwipeDirection;
  isActive: boolean;
}

/**
 * A simple component that shows a visual indicator during swipe gestures
 */
export function SwipeIndicator({ direction, isActive }: SwipeIndicatorProps) {
  // Only show when active and has a direction
  if (!isActive || !direction) return null;

  return (
    <div
      className={cn(
        "fixed top-1/2 transform -translate-y-1/2 z-50 bg-background/80 p-3 rounded-full shadow-md border",
        direction === "left" ? "right-4" : "left-4"
      )}
    >
      {direction === "left" ? (
        <ChevronRight className="h-6 w-6 text-primary" />
      ) : (
        <ChevronLeft className="h-6 w-6 text-primary" />
      )}
    </div>
  );
}
