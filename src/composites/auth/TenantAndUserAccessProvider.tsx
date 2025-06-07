"use client";

import useTenantAndUserAccess from "@/entities/auth/useTenantAndUserAccess";
import { ReactNode } from "react";
import { TenantAndUserAccessContext } from "./TenantAndUserAccessContext";

/**
 * TenantAndUserAccessProvider component for distributing tenant and user data
 *
 * This component:
 * 1. Fetches tenant and user access data
 * 2. Provides tenant and user data to child components via context
 *
 * Use this to provide tenant/user context to child components.
 * Note: This component does not handle authentication protection,
 * loading states, or error handling - it only distributes data.
 */
export default function TenantAndUserAccessProvider({
  domain,
  children,
}: {
  domain: string;
  children: ReactNode;
}) {
  const accessData = useTenantAndUserAccess(domain);

  return (
    <TenantAndUserAccessContext.Provider value={accessData}>
      {children}
    </TenantAndUserAccessContext.Provider>
  );
}
