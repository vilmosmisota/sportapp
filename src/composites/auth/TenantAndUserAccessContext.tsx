"use client";

import useTenantAndUserAccess from "@/entities/auth/useTenantAndUserAccess";
import { createContext, useContext } from "react";

type TenantAndUserAccessContextType = ReturnType<typeof useTenantAndUserAccess>;

const TenantAndUserAccessContext = createContext<
  TenantAndUserAccessContextType | undefined
>(undefined);

export function useTenantAndUserAccessContext() {
  const context = useContext(TenantAndUserAccessContext);
  if (context === undefined) {
    throw new Error(
      "useTenantAndUserAccessContext must be used within a ProtectedLayout component"
    );
  }
  return context;
}

export { TenantAndUserAccessContext };
