/**
 * UI Storage Manager
 *
 * A high-performance utility for persisting UI state in localStorage with type safety.
 * Handles serialization, caching, and provides React hooks for efficient state management.
 */

import { useCallback, useEffect, useState } from "react";

// Storage key prefix to avoid conflicts with other localStorage items
const UI_STORAGE_KEY_PREFIX = "ui-state:";

// Cache to minimize localStorage access
const memoryCache: Record<string, any> = {};

// Check if code is running in browser environment
const isBrowser = typeof window !== "undefined";

/**
 * Type for UI state configuration
 */
export interface UIStateConfig<T> {
  key: string;
  defaultValue: T;
  version?: number; // Optional version for migration support
}

/**
 * Safely access localStorage
 */
function safeLocalStorage() {
  if (isBrowser) {
    try {
      return window.localStorage;
    } catch (e) {
      console.warn("localStorage is not available:", e);
    }
  }

  // Return a mock implementation when localStorage is not available
  const mock: Storage = {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0,
  };

  return mock;
}

/**
 * Saves a UI state value to localStorage and updates memory cache
 */
export function saveUIState<T>(config: UIStateConfig<T>, value: T): void {
  try {
    const { key, version = 1 } = config;
    const storageKey = `${UI_STORAGE_KEY_PREFIX}${key}`;

    // Store with version for potential future migrations
    const dataToStore = {
      version,
      value,
      timestamp: Date.now(),
    };

    // Update memory cache first for immediate access
    memoryCache[storageKey] = dataToStore;

    // Only attempt localStorage operations in browser
    if (isBrowser) {
      // Async localStorage write for better performance
      setTimeout(() => {
        try {
          safeLocalStorage().setItem(storageKey, JSON.stringify(dataToStore));
        } catch (e) {
          console.error("Failed to save to localStorage:", e);
        }
      }, 0);
    }
  } catch (error) {
    console.error(`Failed to save UI state for key ${config.key}:`, error);
  }
}

/**
 * Loads a UI state value from localStorage or memory cache
 */
export function loadUIState<T>(config: UIStateConfig<T>): T {
  try {
    const { key, defaultValue, version = 1 } = config;
    const storageKey = `${UI_STORAGE_KEY_PREFIX}${key}`;

    // Try memory cache first
    if (memoryCache[storageKey]) {
      return memoryCache[storageKey].value;
    }

    // Only attempt localStorage operations in browser
    if (!isBrowser) {
      return defaultValue;
    }

    // Fall back to localStorage
    try {
      const storedData = safeLocalStorage().getItem(storageKey);
      if (!storedData) {
        return defaultValue;
      }

      const parsedData = JSON.parse(storedData);

      // Handle version mismatch (simple fallback to default for now)
      if (parsedData.version !== version) {
        return defaultValue;
      }

      // Update memory cache
      memoryCache[storageKey] = parsedData;

      return parsedData.value;
    } catch (e) {
      console.error("Failed to load from localStorage:", e);
      return defaultValue;
    }
  } catch (error) {
    console.error(`Failed to load UI state for key ${config.key}:`, error);
    return config.defaultValue;
  }
}

/**
 * Clears a specific UI state from localStorage and memory cache
 */
export function clearUIState(key: string): void {
  try {
    const storageKey = `${UI_STORAGE_KEY_PREFIX}${key}`;
    delete memoryCache[storageKey];

    if (isBrowser) {
      safeLocalStorage().removeItem(storageKey);
    }
  } catch (error) {
    console.error(`Failed to clear UI state for key ${key}:`, error);
  }
}

/**
 * Clears all UI states from localStorage and memory cache
 */
export function clearAllUIStates(): void {
  try {
    // Clear memory cache
    Object.keys(memoryCache).forEach((key) => {
      if (key.startsWith(UI_STORAGE_KEY_PREFIX)) {
        delete memoryCache[key];
      }
    });

    // Only attempt localStorage operations in browser
    if (isBrowser) {
      try {
        // Clear localStorage
        const storage = safeLocalStorage();
        Object.keys(storage).forEach((key) => {
          if (key.startsWith(UI_STORAGE_KEY_PREFIX)) {
            storage.removeItem(key);
          }
        });
      } catch (e) {
        console.error("Failed to clear localStorage:", e);
      }
    }
  } catch (error) {
    console.error("Failed to clear all UI states:", error);
  }
}

/**
 * React hook for UI state management with SSR safety
 *
 * @param config Configuration for the UI state
 * @returns [state, setState] tuple similar to useState
 */
export function useUIState<T>(
  config: UIStateConfig<T>
): [T, (value: T | ((prev: T) => T)) => void] {
  const { key, defaultValue } = config;

  // Always initialize with the default value first to prevent hydration issues
  const [state, setState] = useState<T>(defaultValue);

  // Load persisted state after initial render (client-side only)
  useEffect(() => {
    // Only run in the browser
    if (isBrowser) {
      const persistedValue = loadUIState(config);
      // Only update state if the persisted value is different
      if (JSON.stringify(persistedValue) !== JSON.stringify(defaultValue)) {
        setState(persistedValue);
      }
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save state to localStorage when it changes
  const setUIState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prevState) => {
        const newState = value instanceof Function ? value(prevState) : value;
        saveUIState(config, newState);
        return newState;
      });
    },
    [config]
  );

  // Sync state if localStorage is modified in another tab
  useEffect(() => {
    if (!isBrowser) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `${UI_STORAGE_KEY_PREFIX}${key}` && event.newValue) {
        try {
          const newData = JSON.parse(event.newValue);
          setState(newData.value);
        } catch (e) {
          console.error("Failed to parse storage event:", e);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [state, setUIState];
}

/**
 * Type-safe UI state manager factory for common UI components
 */
export function createUIStateManager<T extends Record<string, any>>(
  namespace: string,
  defaultValues: T
) {
  return {
    getState: <K extends keyof T>(key: K): T[K] => {
      const config = {
        key: `${namespace}.${key as string}`,
        defaultValue: defaultValues[key],
      };
      return loadUIState(config);
    },

    setState: <K extends keyof T>(key: K, value: T[K]): void => {
      const config = {
        key: `${namespace}.${key as string}`,
        defaultValue: defaultValues[key],
      };
      saveUIState(config, value);
    },

    useState: <K extends keyof T>(
      key: K
    ): [T[K], (value: T[K] | ((prev: T[K]) => T[K])) => void] => {
      const config = {
        key: `${namespace}.${key as string}`,
        defaultValue: defaultValues[key],
      };
      return useUIState(config);
    },

    clearState: (key?: keyof T): void => {
      if (key) {
        clearUIState(`${namespace}.${key as string}`);
      } else {
        // Clear all states in this namespace
        Object.keys(defaultValues).forEach((k) => {
          clearUIState(`${namespace}.${k}`);
        });
      }
    },
  };
}
