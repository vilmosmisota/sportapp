/**
 * UI Storage Unit Tests
 *
 * These tests verify the functionality of the UI storage system.
 * Run with Jest or Vitest.
 */

import { act, renderHook } from "@testing-library/react";
import {
  clearAllUIStates,
  clearUIState,
  createUIStateManager,
  loadUIState,
  saveUIState,
  useUIState,
} from "./ui-storage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    store,
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    length: jest.fn(() => Object.keys(store).length),
  };
})();

// Mock window.localStorage
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Reset localStorage between tests
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});

describe("UI Storage Core Functions", () => {
  test("saveUIState should save value to localStorage", () => {
    // Mock setTimeout to execute immediately
    jest.useFakeTimers();

    const config = { key: "test.key", defaultValue: "default" };
    saveUIState(config, "test-value");

    // Run the setTimeout callback
    jest.runAllTimers();

    // Verify localStorage was called with the correct data
    expect(localStorageMock.setItem).toHaveBeenCalled();

    // Check the value was properly serialized
    const setItemCall = localStorageMock.setItem.mock.calls[0];
    const [key, value] = setItemCall;

    expect(key).toBe("ui-state:test.key");

    // Parse stored JSON data
    const storedData = JSON.parse(value);
    expect(storedData.value).toBe("test-value");
    expect(storedData.version).toBe(1);
    expect(typeof storedData.timestamp).toBe("number");

    jest.useRealTimers();
  });

  test("loadUIState should load value from localStorage", () => {
    const config = { key: "test.key", defaultValue: "default" };
    const storedData = {
      version: 1,
      value: "stored-value",
      timestamp: Date.now(),
    };

    // Setup localStorage with test data
    localStorageMock.setItem("ui-state:test.key", JSON.stringify(storedData));

    // Load the value
    const result = loadUIState(config);

    // Verify the correct value was loaded
    expect(result).toBe("stored-value");
    expect(localStorageMock.getItem).toHaveBeenCalledWith("ui-state:test.key");
  });

  test("loadUIState should return default value when no stored value exists", () => {
    const config = { key: "nonexistent.key", defaultValue: "default-value" };
    const result = loadUIState(config);

    expect(result).toBe("default-value");
  });

  test("loadUIState should return default if version mismatch", () => {
    const config = { key: "test.key", defaultValue: "default", version: 2 };
    const storedData = {
      version: 1, // Old version
      value: "old-value",
      timestamp: Date.now(),
    };

    // Setup localStorage with test data with old version
    localStorageMock.setItem("ui-state:test.key", JSON.stringify(storedData));

    // Load the value
    const result = loadUIState(config);

    // Should return default due to version mismatch
    expect(result).toBe("default");
  });

  test("clearUIState should remove item from localStorage", () => {
    // Setup localStorage with test data
    localStorageMock.setItem(
      "ui-state:test.key",
      JSON.stringify({ value: "test" })
    );

    clearUIState("test.key");

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      "ui-state:test.key"
    );
  });

  test("Memory cache should be used for subsequent reads", () => {
    const config = { key: "test.key", defaultValue: "default" };

    // Setup localStorage with test data
    const storedData = {
      version: 1,
      value: "initial-value",
      timestamp: Date.now(),
    };
    localStorageMock.setItem("ui-state:test.key", JSON.stringify(storedData));

    // First read should access localStorage
    const firstResult = loadUIState(config);
    expect(firstResult).toBe("initial-value");
    expect(localStorageMock.getItem).toHaveBeenCalledTimes(1);

    // Update localStorage directly (bypassing our API)
    const updatedData = {
      version: 1,
      value: "updated-value",
      timestamp: Date.now(),
    };
    localStorageMock.setItem("ui-state:test.key", JSON.stringify(updatedData));

    // Second read should use memory cache, not access localStorage again
    const secondResult = loadUIState(config);
    expect(secondResult).toBe("initial-value"); // Still has initial value from cache
    expect(localStorageMock.getItem).toHaveBeenCalledTimes(1); // No additional call
  });
});

describe("React Hook: useUIState", () => {
  test("useUIState should initialize with stored value", () => {
    // Setup localStorage with test data
    const storedData = {
      version: 1,
      value: "stored-value",
      timestamp: Date.now(),
    };
    localStorageMock.setItem("ui-state:test.hook", JSON.stringify(storedData));

    // Render hook
    const { result } = renderHook(() =>
      useUIState({ key: "test.hook", defaultValue: "default-value" })
    );

    // Check initial state
    expect(result.current[0]).toBe("stored-value");
  });

  test("useUIState should update state and localStorage", () => {
    // Mock setTimeout to execute immediately
    jest.useFakeTimers();

    // Render hook
    const { result } = renderHook(() =>
      useUIState({ key: "test.update", defaultValue: "default-value" })
    );

    // Update state
    act(() => {
      result.current[1]("new-value");
    });

    // Run the setTimeout callback
    jest.runAllTimers();

    // Check state update
    expect(result.current[0]).toBe("new-value");

    // Check localStorage update
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const setItemCall = localStorageMock.setItem.mock.calls[0];
    const [key, value] = setItemCall;

    expect(key).toBe("ui-state:test.update");
    const storedData = JSON.parse(value);
    expect(storedData.value).toBe("new-value");

    jest.useRealTimers();
  });

  test("useUIState should support functional updates", () => {
    // Mock setTimeout
    jest.useFakeTimers();

    // Initial data
    const storedData = {
      version: 1,
      value: 5, // Number for this test
      timestamp: Date.now(),
    };
    localStorageMock.setItem(
      "ui-state:test.counter",
      JSON.stringify(storedData)
    );

    // Render hook
    const { result } = renderHook(() =>
      useUIState({ key: "test.counter", defaultValue: 0 })
    );

    // Update with function
    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });

    // Run the setTimeout callback
    jest.runAllTimers();

    // Check state update
    expect(result.current[0]).toBe(6);

    // Check localStorage update
    const setItemCall = localStorageMock.setItem.mock.calls[0];
    const [, value] = setItemCall;
    const storedUpdatedData = JSON.parse(value);
    expect(storedUpdatedData.value).toBe(6);

    jest.useRealTimers();
  });
});

describe("UI State Manager", () => {
  // Setup a manager for testing
  interface TestState {
    counter: number;
    name: string;
    items: string[];
  }

  const manager = createUIStateManager<TestState>("test", {
    counter: 0,
    name: "default",
    items: [],
  });

  test("State manager should get values", () => {
    // Setup localStorage with test data
    const storedData = {
      version: 1,
      value: 42,
      timestamp: Date.now(),
    };
    localStorageMock.setItem(
      "ui-state:test.counter",
      JSON.stringify(storedData)
    );

    const value = manager.getState("counter");
    expect(value).toBe(42);
  });

  test("State manager should set values", () => {
    jest.useFakeTimers();

    manager.setState("name", "test-name");

    // Run the setTimeout callback
    jest.runAllTimers();

    // Check localStorage update
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const setItemCall = localStorageMock.setItem.mock.calls[0];
    const [key, value] = setItemCall;

    expect(key).toBe("ui-state:test.name");
    const storedData = JSON.parse(value);
    expect(storedData.value).toBe("test-name");

    jest.useRealTimers();
  });

  test("State manager should clear specific state", () => {
    // Setup localStorage with test data
    localStorageMock.setItem(
      "ui-state:test.counter",
      JSON.stringify({ value: 42 })
    );
    localStorageMock.setItem(
      "ui-state:test.name",
      JSON.stringify({ value: "test" })
    );

    manager.clearState("counter");

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      "ui-state:test.counter"
    );
    expect(localStorageMock.removeItem).not.toHaveBeenCalledWith(
      "ui-state:test.name"
    );
  });

  test("State manager should clear all namespace states", () => {
    // Setup localStorage with test data
    localStorageMock.setItem(
      "ui-state:test.counter",
      JSON.stringify({ value: 42 })
    );
    localStorageMock.setItem(
      "ui-state:test.name",
      JSON.stringify({ value: "test" })
    );
    localStorageMock.setItem(
      "ui-state:other.key",
      JSON.stringify({ value: "other" })
    );

    manager.clearState(); // No args = clear all states in namespace

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      "ui-state:test.counter"
    );
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      "ui-state:test.name"
    );
    expect(localStorageMock.removeItem).not.toHaveBeenCalledWith(
      "ui-state:other.key"
    );
  });

  test("Manager useState hook should work like useUIState", () => {
    // Mock setTimeout
    jest.useFakeTimers();

    // Render hook
    const { result } = renderHook(() => manager.useState("items"));

    // Initial state should be default value
    expect(result.current[0]).toEqual([]);

    // Update state with new array
    act(() => {
      result.current[1](["item1", "item2"]);
    });

    // Run the setTimeout callback
    jest.runAllTimers();

    // Check state update
    expect(result.current[0]).toEqual(["item1", "item2"]);

    // Check localStorage update
    const setItemCall = localStorageMock.setItem.mock.calls[0];
    const [key, value] = setItemCall;

    expect(key).toBe("ui-state:test.items");
    const storedData = JSON.parse(value);
    expect(storedData.value).toEqual(["item1", "item2"]);

    jest.useRealTimers();
  });
});
