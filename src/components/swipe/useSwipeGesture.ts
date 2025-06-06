import {
  useRef,
  useCallback,
  useState,
  useEffect,
  TouchEvent,
  MouseEvent,
} from "react";

export type SwipeDirection = "left" | "right" | null;

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
  blockScrollWhenActive?: boolean;
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

// This function will be attached to the document to prevent scroll
// We need to define it outside the hook to maintain proper reference
const preventDefault = (e: Event) => {
  e.preventDefault();
};

/**
 * A hook for detecting horizontal swipe gestures on touch devices
 * Provides both event handlers and current swipe state
 *
 * @param onSwipeLeft - Callback function when user swipes left
 * @param onSwipeRight - Callback function when user swipes right
 * @param swipeThreshold - Minimum distance in pixels to trigger a swipe (default: 50)
 * @param blockScrollWhenActive - Whether to prevent vertical scrolling when swiping (default: true)
 * @returns An object with event handlers to be spread onto a component and swipe state
 */
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 50,
  blockScrollWhenActive = true,
}: SwipeHandlers): SwipeGestureResult {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null); // Track vertical position too
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const isHorizontalSwipe = useRef(false);

  // For mouse events (touch pads)
  const mouseDown = useRef<boolean>(false);
  const mouseStartX = useRef<number | null>(null);

  // Track if we're currently blocking scroll
  const isBlockingScroll = useRef(false);

  // Helper to lock scrolling by adding event listeners to the document
  const lockScrolling = useCallback(() => {
    if (!isBlockingScroll.current && blockScrollWhenActive) {
      // These options are crucial - passive: false lets us call preventDefault
      document.addEventListener("touchmove", preventDefault, {
        passive: false,
      });
      document.addEventListener("wheel", preventDefault, { passive: false });
      isBlockingScroll.current = true;
    }
  }, [blockScrollWhenActive]);

  // Helper to unlock scrolling by removing event listeners
  const unlockScrolling = useCallback(() => {
    if (isBlockingScroll.current && blockScrollWhenActive) {
      document.removeEventListener("touchmove", preventDefault);
      document.removeEventListener("wheel", preventDefault);
      isBlockingScroll.current = false;
    }
  }, [blockScrollWhenActive]);

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      unlockScrolling();
    };
  }, [unlockScrolling]);

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
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndX.current = null; // Reset end position
    isHorizontalSwipe.current = false; // Reset horizontal detection
    setIsSwipeActive(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const currentX = e.targetTouches[0].clientX;
      const currentY = e.targetTouches[0].clientY;
      touchEndX.current = currentX;

      // Calculate horizontal and vertical movement
      const horizontalDiff = Math.abs(currentX - touchStartX.current);
      const verticalDiff = Math.abs(currentY - touchStartY.current);

      // Determine if this is primarily a horizontal swipe
      // Only do this determination once at the start of the swipe
      if (
        !isHorizontalSwipe.current &&
        (horizontalDiff > 10 || verticalDiff > 10)
      ) {
        isHorizontalSwipe.current = horizontalDiff > verticalDiff;

        // If it's a horizontal swipe, prevent all scrolling immediately
        if (isHorizontalSwipe.current) {
          lockScrolling();
        }
      }

      // Only prevent default and update visuals if we've determined this is a horizontal swipe
      if (isHorizontalSwipe.current) {
        e.preventDefault(); // Prevent scrolling when swiping horizontally
        // Update direction for indicator
        updateSwipeDirection(currentX, touchStartX.current);
      }
    },
    [updateSwipeDirection, lockScrolling]
  );

  const handleTouchEnd = useCallback(() => {
    // Always unlock scrolling when touch ends
    unlockScrolling();

    if (touchStartX.current === null || touchEndX.current === null) {
      setIsSwipeActive(false);
      setSwipeDirection(null);
      isHorizontalSwipe.current = false;
      return;
    }

    const distance = touchEndX.current - touchStartX.current;
    const isSignificantSwipe = Math.abs(distance) > swipeThreshold;

    if (isSignificantSwipe && isHorizontalSwipe.current) {
      if (distance > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (distance < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = false;
    setIsSwipeActive(false);
    setSwipeDirection(null);
  }, [
    onSwipeLeft,
    onSwipeRight,
    swipeThreshold,
    updateSwipeDirection,
    unlockScrolling,
  ]);

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

      // Only prevent default if it's potentially a swipe
      if (Math.abs(currentX - mouseStartX.current) > 10) {
        e.preventDefault();

        // If we haven't marked this as a horizontal swipe yet, do so and lock scrolling
        if (!isHorizontalSwipe.current) {
          isHorizontalSwipe.current = true;
          lockScrolling();
        }

        // Update direction for indicator
        updateSwipeDirection(currentX, mouseStartX.current);
      }
    },
    [updateSwipeDirection, lockScrolling]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      // Always unlock scrolling when mouse up
      unlockScrolling();

      if (!mouseDown.current || mouseStartX.current === null) {
        mouseDown.current = false;
        setIsSwipeActive(false);
        setSwipeDirection(null);
        isHorizontalSwipe.current = false;
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
      isHorizontalSwipe.current = false;
      setIsSwipeActive(false);
      setSwipeDirection(null);
    },
    [
      onSwipeLeft,
      onSwipeRight,
      swipeThreshold,
      updateSwipeDirection,
      unlockScrolling,
    ]
  );

  // Also handle mouse leave to avoid stuck states
  const handleMouseLeave = useCallback(() => {
    // Always unlock scrolling when mouse leaves
    unlockScrolling();

    mouseDown.current = false;
    mouseStartX.current = null;
    isHorizontalSwipe.current = false;
    setIsSwipeActive(false);
    setSwipeDirection(null);
  }, [unlockScrolling]);

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
