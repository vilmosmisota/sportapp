"use client";

import { createContext, ReactNode, useContext } from "react";
import { DashboardContextValue } from "../types/baseDashboard.types";

const DashboardContext = createContext<DashboardContextValue | undefined>(
  undefined
);

interface DashboardContextProviderProps {
  children: ReactNode;
  value: DashboardContextValue;
}

export function DashboardContextProvider({
  children,
  value,
}: DashboardContextProviderProps) {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardContext must be used within a DashboardContextProvider"
    );
  }
  return context;
}

// Optional hook that doesn't throw an error if used outside provider
export function useDashboardContextOptional() {
  return useContext(DashboardContext);
}
