import { useRef, useCallback, useState, TouchEvent, MouseEvent } from "react";

export type SwipeDirection = "left" | "right" | null;

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
}

interface SwipeGestureResult {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: () => void;
  onMouseDown: (e: MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
  onMouseUp: (e: MouseEvent) => void;
  onMouseLeave: () => void;
  swipeDirection: SwipeDirection;
  isSwipeActive: boolean;
}

/**
 * A hook for detecting horizontal swipe gestures on touch devices
 * Provides both event handlers and current swipe state
 *
 * @param onSwipeLeft - Callback function when user swipes left
 * @param onSwipeRight - Callback function when user swipes right
 * @param swipeThreshold - Minimum distance in pixels to trigger a swipe (default: 50)
 * @returns An object with event handlers to be spread onto a component and swipe state
 */
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 50,
}: SwipeHandlers): SwipeGestureResult {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
  const [isSwipeActive, setIsSwipeActive] = useState(false);

  // For mouse events (touch pads)
  const mouseDown = useRef<boolean>(false);
  const mouseStartX = useRef<number | null>(null);

  // Helper to determine current swipe direction based on movement
  const updateSwipeDirection = useCallback(
    (currentX: number, startX: number) => {
      const diff = currentX - startX;
      if (Math.abs(diff) < 10) {
        setSwipeDirection(null);
      } else if (diff > 0) {
        setSwipeDirection("right");
      } else {
        setSwipeDirection("left");
      }
    },
    []
  );

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null; // Reset end position
    setIsSwipeActive(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (touchStartX.current === null) return;

      const currentX = e.targetTouches[0].clientX;
      touchEndX.current = currentX;

      // Update direction for indicator
      updateSwipeDirection(currentX, touchStartX.current);
    },
    [updateSwipeDirection]
  );

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null) {
      setIsSwipeActive(false);
      setSwipeDirection(null);
      return;
    }

    const distance = touchEndX.current - touchStartX.current;
    const isSignificantSwipe = Math.abs(distance) > swipeThreshold;

    if (isSignificantSwipe) {
      if (distance > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (distance < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
    setIsSwipeActive(false);
    setSwipeDirection(null);
  }, [onSwipeLeft, onSwipeRight, swipeThreshold, updateSwipeDirection]);

  // Handle mouse events for touch pads
  const handleMouseDown = useCallback((e: MouseEvent) => {
    mouseDown.current = true;
    mouseStartX.current = e.clientX;
    setIsSwipeActive(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!mouseDown.current || mouseStartX.current === null) return;

      const currentX = e.clientX;

      // Update direction for indicator
      updateSwipeDirection(currentX, mouseStartX.current);

      // Only prevent default if it's potentially a swipe
      if (Math.abs(currentX - mouseStartX.current) > 10) {
        e.preventDefault();
      }
    },
    [updateSwipeDirection]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!mouseDown.current || mouseStartX.current === null) {
        mouseDown.current = false;
        setIsSwipeActive(false);
        setSwipeDirection(null);
        return;
      }

      const distance = e.clientX - mouseStartX.current;
      const isSignificantSwipe = Math.abs(distance) > swipeThreshold;

      if (isSignificantSwipe) {
        if (distance > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (distance < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }

      // Reset values
      mouseDown.current = false;
      mouseStartX.current = null;
      setIsSwipeActive(false);
      setSwipeDirection(null);
    },
    [onSwipeLeft, onSwipeRight, swipeThreshold, updateSwipeDirection]
  );

  // Also handle mouse leave to avoid stuck states
  const handleMouseLeave = useCallback(() => {
    mouseDown.current = false;
    mouseStartX.current = null;
    setIsSwipeActive(false);
    setSwipeDirection(null);
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    swipeDirection,
    isSwipeActive,
  };
}
