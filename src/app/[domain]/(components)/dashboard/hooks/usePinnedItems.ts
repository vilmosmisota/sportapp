import { useState } from "react";

export function usePinnedItems() {
  // Initialize with Home (id: 1) and Schedule (id: 2) as default pinned items
  const [pinnedItemIds, setPinnedItemIds] = useState<number[]>([1, 2]);

  // Define which items cannot be unpinned
  const requiredPinnedItems = [1, 2]; // Home and Schedule

  const togglePinItem = (itemId: number) => {
    // Check if this is a required pinned item; if so, don't allow unpinning
    if (
      requiredPinnedItems.includes(itemId) &&
      pinnedItemIds.includes(itemId)
    ) {
      return; // Don't allow unpinning for required items
    }

    setPinnedItemIds((prev) => {
      if (prev.includes(itemId)) {
        // If already pinned, unpin it
        return prev.filter((id) => id !== itemId);
      } else {
        // If not pinned, pin it
        return [...prev, itemId];
      }
    });
  };

  const isPinned = (itemId: number) => {
    return pinnedItemIds.includes(itemId);
  };

  const isRequiredPin = (itemId: number) => {
    return requiredPinnedItems.includes(itemId);
  };

  return {
    pinnedItemIds,
    togglePinItem,
    isPinned,
    isRequiredPin,
  };
}
