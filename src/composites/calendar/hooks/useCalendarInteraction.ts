"use client";

import { useRef, useState } from "react";

// Add a type declaration for the __openContextMenu property
declare global {
  interface HTMLElement {
    __openContextMenu?: () => void;
  }
}

interface UseCalendarInteractionOptions {
  doubleClickDelay?: number;
  touchDuration?: number;
}

export function useCalendarInteraction({
  doubleClickDelay = 300,
  touchDuration = 500,
}: UseCalendarInteractionOptions = {}) {
  const [touchStartTime, setTouchStartTime] = useState<number | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isDoubleClick, setIsDoubleClick] = useState(false);
  const [isTouchHold, setIsTouchHold] = useState(false);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle double click detection
  const handleDoubleClick =
    (callback?: (event: React.MouseEvent) => void) =>
    (event: React.MouseEvent) => {
      if (callback) {
        callback(event);
      }
    };

  // Handle touch start for long press detection
  const handleTouchStart =
    (callback?: (event: React.TouchEvent) => void) =>
    (event: React.TouchEvent) => {
      // Check if event.touches exists and has at least one touch
      if (!event.touches || event.touches.length === 0) {
        return;
      }

      const touch = event.touches[0];
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      setTouchStartTime(Date.now());

      // Clear any existing timeout
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }

      // Set timeout for long press
      touchTimeoutRef.current = setTimeout(() => {
        setIsTouchHold(true);
        if (callback) {
          callback(event);
        }
      }, touchDuration);
    };

  // Handle touch end
  const handleTouchEnd =
    (callback?: (event: React.TouchEvent) => void) =>
    (event: React.TouchEvent) => {
      // Clear the timeout to prevent false triggers
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }

      // Reset state
      setTouchStartTime(null);
      touchStartPos.current = null;
      setIsTouchHold(false);

      // If we have a callback and this was a long press, call it
      if (isTouchHold && callback) {
        callback(event);
      }
    };

  // Helper to trigger context menu programmatically
  const triggerContextMenu = (element: HTMLElement) => {
    if (element && element.__openContextMenu) {
      element.__openContextMenu();
    }
  };

  return {
    handleDoubleClick,
    handleTouchStart,
    handleTouchEnd,
    isDoubleClick,
    isTouchHold,
    triggerContextMenu,
  };
}
