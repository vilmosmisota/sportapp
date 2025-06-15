"use client";

import { useState } from "react";

export function useCalendarInteraction() {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleTouchStart =
    (callback: (e: React.TouchEvent) => void) => (e: React.TouchEvent) => {
      // Start a timer for long press (500ms is typical)
      const timer = setTimeout(() => {
        callback(e);
      }, 500);

      setLongPressTimer(timer);
    };

  const handleTouchEnd = () => {
    // Clear the timer if touch ends before long press threshold
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Modified to accept and pass the event object
  const handleDoubleClick =
    (callback: (e: React.MouseEvent) => void) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      callback(e);
    };

  return {
    handleTouchStart,
    handleTouchEnd,
    handleDoubleClick,
  };
}
