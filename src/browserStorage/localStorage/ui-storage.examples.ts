/**
 * UI Storage Examples
 *
 * This file demonstrates various ways to use the UI storage system.
 * These examples are for reference and should not be used directly in production.
 */

import { createUIStateManager, useUIState } from "./ui-storage";

/**
 * Example 1: Basic usage with individual hooks
 *
 * Use this approach when you need to manage UI state in a specific component.
 */
export function BasicUsageExample() {
  // Example for a sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useUIState({
    key: "sidebar.collapsed",
    defaultValue: false,
  });

  // Example for toggling sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed((prev: boolean) => !prev);
  };

  return {
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
  };
}

/**
 * Example 2: Using the UI state manager for a group of related UI states
 *
 * Use this approach when you need to manage multiple related UI states,
 * like all states related to a specific component or feature.
 */

// Define the shape of your sidebar UI state
interface SidebarUIState {
  collapsed: boolean;
  width: number;
  pinnedItems: string[];
  lastOpenTimestamp: number;
}

// Create a sidebar UI state manager with default values
export const sidebarStateManager = createUIStateManager<SidebarUIState>(
  "sidebar",
  {
    collapsed: false,
    width: 280,
    pinnedItems: [],
    lastOpenTimestamp: Date.now(),
  }
);

// Example usage of the sidebar state manager
export function SidebarManagerExample() {
  // Get the current state programmatically (without React)
  const isPanelCollapsed = sidebarStateManager.getState("collapsed");
  const currentWidth = sidebarStateManager.getState("width");

  // Update a state programmatically
  function collapsePanel() {
    sidebarStateManager.setState("collapsed", true);
  }

  // Use with React hooks
  function SidebarComponent() {
    // Use the state in a React component with the useState hook variant
    const [collapsed, setCollapsed] = sidebarStateManager.useState("collapsed");
    const [pinnedItems, setPinnedItems] =
      sidebarStateManager.useState("pinnedItems");

    function toggleSidebar() {
      setCollapsed((prev: boolean) => !prev);
      sidebarStateManager.setState("lastOpenTimestamp", Date.now());
    }

    function addPinnedItem(id: string) {
      setPinnedItems((prev: string[]) => [...prev, id]);
    }

    function removePinnedItem(id: string) {
      setPinnedItems((prev: string[]) =>
        prev.filter((item: string) => item !== id)
      );
    }

    // Clear all sidebar state if needed
    function resetSidebar() {
      sidebarStateManager.clearState();
    }

    return {
      collapsed,
      toggleSidebar,
      pinnedItems,
      addPinnedItem,
      removePinnedItem,
      resetSidebar,
    };
  }

  return {
    isPanelCollapsed,
    currentWidth,
    collapsePanel,
    SidebarComponent,
  };
}

/**
 * Example 3: Advanced usage with multiple state managers
 *
 * This approach can be used to manage various aspects of your UI
 * by organizing them into logical groups.
 */

// Define different state managers for various UI components
export const accordionStateManager = createUIStateManager("accordion", {
  expandedSections: [] as string[], // IDs of expanded accordion sections
  lastSection: null as string | null,
});

export const tableStateManager = createUIStateManager("table", {
  sortColumn: null as string | null,
  sortDirection: "asc" as "asc" | "desc",
  pageSize: 10,
  visibleColumns: [] as string[],
});

export const themeStateManager = createUIStateManager("theme", {
  mode: "light" as "light" | "dark" | "system",
  fontSize: "medium" as "small" | "medium" | "large",
  highContrast: false,
});

// Example of integrating multiple state managers in a component
export function CombinedUiStateExample() {
  // In a settings panel component
  function SettingsPanel() {
    const [theme, setTheme] = themeStateManager.useState("mode");
    const [fontSize, setFontSize] = themeStateManager.useState("fontSize");
    const [highContrast, setHighContrast] =
      themeStateManager.useState("highContrast");

    // Get table settings
    const [pageSize, setPageSize] = tableStateManager.useState("pageSize");
    const [visibleColumns, setVisibleColumns] =
      tableStateManager.useState("visibleColumns");

    function resetAllSettings() {
      themeStateManager.clearState();
      tableStateManager.clearState();
    }

    return {
      theme,
      setTheme,
      fontSize,
      setFontSize,
      highContrast,
      setHighContrast,
      pageSize,
      setPageSize,
      visibleColumns,
      setVisibleColumns,
      resetAllSettings,
    };
  }

  return {
    SettingsPanel,
  };
}
