import { useUIState } from "@/browserStorage/localStorage/ui-storage";
import { useEffect } from "react";
import { BaseNavItem, BaseNavSection } from "../types/baseDashboard.types";

export interface GlobalPinnedItem extends BaseNavItem {
  portalType: string; // Which portal this item belongs to
}

// Composite key to uniquely identify items across portals
export interface PinnedItemKey {
  id: number;
  portalType: string;
}

// Custom event name for cross-component reactivity
const PINNED_ITEMS_CHANGED_EVENT = "dashboard-pinned-items-changed";

export function useGlobalPinnedItems() {
  // Global storage key for all pinned items across portals
  const [pinnedItemKeys, setPinnedItemKeys] = useUIState<PinnedItemKey[]>({
    key: "dashboard.global.pinnedItems",
    defaultValue: [],
  });

  // Listen for pinned items changes from other components
  useEffect(() => {
    const handlePinnedItemsChange = (event: CustomEvent) => {
      // Force a re-render by updating the state with the new value from the event
      setPinnedItemKeys(event.detail.pinnedItemKeys);
    };

    window.addEventListener(
      PINNED_ITEMS_CHANGED_EVENT,
      handlePinnedItemsChange as EventListener
    );

    return () => {
      window.removeEventListener(
        PINNED_ITEMS_CHANGED_EVENT,
        handlePinnedItemsChange as EventListener
      );
    };
  }, [setPinnedItemKeys]);

  const togglePinItem = (item: BaseNavItem, portalType: string) => {
    const itemKey: PinnedItemKey = { id: item.id, portalType };

    setPinnedItemKeys((prev: PinnedItemKey[]) => {
      const existingIndex = prev.findIndex(
        (key) => key.id === item.id && key.portalType === portalType
      );

      const newPinnedItemKeys =
        existingIndex >= 0
          ? prev.filter((_, index) => index !== existingIndex) // Unpin
          : [...prev, itemKey]; // Pin

      // Dispatch custom event to notify other components
      setTimeout(() => {
        const event = new CustomEvent(PINNED_ITEMS_CHANGED_EVENT, {
          detail: { pinnedItemKeys: newPinnedItemKeys },
        });
        window.dispatchEvent(event);
      }, 0);

      return newPinnedItemKeys;
    });
  };

  const isPinned = (itemId: number, portalType?: string) => {
    if (portalType) {
      return pinnedItemKeys.some(
        (key) => key.id === itemId && key.portalType === portalType
      );
    }
    // If no portal type specified, check if item is pinned in any portal
    return pinnedItemKeys.some((key) => key.id === itemId);
  };

  const getPinnedItems = (
    managementNavSections: BaseNavSection[],
    schedulingNavSections: BaseNavSection[],
    attendanceNavSections: BaseNavSection[],
    membersNavSections: BaseNavSection[]
  ): GlobalPinnedItem[] => {
    const allItems: GlobalPinnedItem[] = [];

    // Add management items
    managementNavSections.forEach((section) => {
      section.items.forEach((item) => {
        allItems.push({
          ...item,
          portalType: "management",
        });
      });
    });

    // Add scheduling items
    schedulingNavSections.forEach((section) => {
      section.items.forEach((item) => {
        allItems.push({
          ...item,
          portalType: "scheduling",
        });
      });
    });

    // Add attendance items
    attendanceNavSections.forEach((section) => {
      section.items.forEach((item) => {
        allItems.push({
          ...item,
          portalType: "attendance",
        });
      });
    });

    // Add members items
    membersNavSections.forEach((section) => {
      section.items.forEach((item) => {
        allItems.push({
          ...item,
          portalType: "members",
        });
      });
    });

    // Filter to only pinned items
    return allItems.filter((item) =>
      pinnedItemKeys.some(
        (key) => key.id === item.id && key.portalType === item.portalType
      )
    );
  };

  return {
    pinnedItemKeys,
    togglePinItem,
    isPinned,
    getPinnedItems,
  };
}
