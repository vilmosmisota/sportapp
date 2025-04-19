# UI Storage System

A high-performance, type-safe utility for persisting UI state in localStorage with memory caching and React hooks.

## Features

- 🚀 **High Performance**: Uses in-memory cache to minimize localStorage reads
- 🛡️ **Type Safety**: Full TypeScript support with generics
- 🔄 **Sync Across Tabs**: UI state stays in sync across browser tabs
- 🧠 **Smart Defaults**: Falls back to default values when storage is unavailable
- 🏭 **Factory Pattern**: Create state managers for logically grouped UI states
- ⚛️ **React Integration**: Custom hooks that work like React's useState

## Basic Usage

### Individual UI State

Use the `useUIState` hook for simple cases:

```tsx
import { useUIState } from "@/utils/ui-storage";

function Sidebar() {
  // Similar to useState, but persists to localStorage
  const [collapsed, setCollapsed] = useUIState({
    key: "sidebar.collapsed",
    defaultValue: false,
  });

  return (
    <div className={collapsed ? "collapsed" : ""}>
      <button onClick={() => setCollapsed(!collapsed)}>Toggle Sidebar</button>
    </div>
  );
}
```

### Without React

You can also use the system without React:

```ts
import { saveUIState, loadUIState } from "@/utils/ui-storage";

// Save a value
saveUIState({ key: "theme.mode", defaultValue: "light" }, "dark");

// Load a value
const currentTheme = loadUIState({ key: "theme.mode", defaultValue: "light" });
```

## State Managers

For managing groups of related UI states, use the `createUIStateManager` factory:

```ts
// Define your state shape
interface SidebarState {
  collapsed: boolean;
  width: number;
  pinnedItems: string[];
}

// Create a manager with defaults
const sidebarManager = createUIStateManager<SidebarState>("sidebar", {
  collapsed: false,
  width: 280,
  pinnedItems: [],
});

// In a React component
function SidebarWithPins() {
  const [collapsed, setCollapsed] = sidebarManager.useState("collapsed");
  const [pinnedItems, setPinnedItems] = sidebarManager.useState("pinnedItems");

  function addPin(id: string) {
    setPinnedItems((prev) => [...prev, id]);
  }

  // Access programmatically (outside React)
  console.log("Current width:", sidebarManager.getState("width"));

  // Update programmatically
  function resetSidebar() {
    sidebarManager.clearState(); // Clears all sidebar states
  }

  // ...
}
```

## Performance Considerations

The system is designed to be highly performant:

1. **Memory Caching**: First read is from localStorage, subsequent reads from memory
2. **Async Writes**: localStorage writes are deferred to avoid blocking the main thread
3. **Efficient Updates**: Only changed values are saved to localStorage
4. **Version Support**: Handles schema migrations with version tracking

## Best Practices

1. **Group Related States**: Use state managers to organize related UI states
2. **Namespace Keys**: Always use descriptive, namespaced keys (e.g., `sidebar.collapsed`)
3. **Provide Defaults**: Always provide sensible default values
4. **Limited Scope**: Store only UI state, not application data
5. **Small Values**: Keep stored values small (avoid storing large objects or arrays)

## Real-World Examples

- Sidebar collapsed state
- Theme preferences (dark/light mode)
- Table sorting and pagination preferences
- Form wizard progress
- Recently viewed items
- Accordion expanded sections
- Dashboard widget arrangements
- Filter panel states

See `ui-storage.examples.ts` for complete usage examples.

## API Reference

### Core Functions

- `useUIState<T>(config)`: React hook for UI state
- `saveUIState<T>(config, value)`: Save state to localStorage
- `loadUIState<T>(config)`: Load state from localStorage
- `clearUIState(key)`: Clear specific state
- `clearAllUIStates()`: Clear all UI states
- `createUIStateManager<T>(namespace, defaultValues)`: Create a state manager

### Types

- `UIStateConfig<T>`: Configuration for UI state (key, defaultValue, version)
