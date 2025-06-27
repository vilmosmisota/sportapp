import { useUIState } from "@/browserStorage/localStorage/ui-storage";
import { PortalType } from "../types/baseDashboard.types";
import { getPinnedItemsConfig } from "../utils/dashboardUtils";

export function usePortalPinnedItems(portalType: PortalType) {
  const config = getPinnedItemsConfig(portalType);

  // Use portal-specific storage key and defaults
  const [pinnedItemIds, setPinnedItemIds] = useUIState<number[]>({
    key: config.storageKey,
    defaultValue: config.defaultPinnedItems,
  });

  const togglePinItem = (itemId: number) => {
    // Check if this is a required pinned item; if so, don't allow unpinning
    if (
      config.requiredPinnedItems.includes(itemId) &&
      pinnedItemIds.includes(itemId)
    ) {
      return; // Don't allow unpinning for required items
    }

    setPinnedItemIds((prev: number[]) => {
      if (prev.includes(itemId)) {
        // If already pinned, unpin it
        return prev.filter((id: number) => id !== itemId);
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
    return config.requiredPinnedItems.includes(itemId);
  };

  return {
    pinnedItemIds,
    togglePinItem,
    isPinned,
    isRequiredPin,
    config,
  };
}
