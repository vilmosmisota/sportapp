"use client";

import { ReactNode } from "react";
import useTenantAndUserAccess from "@/entities/auth/useTenantAndUserAccess";
import { TenantAndUserAccessContext } from "./TenantAndUserAccessContext";

/**
 * ProtectedLayout component for wrapping layouts/pages that require authentication and tenant access
 *
 * This component:
 * 1. Validates user authentication
 * 2. Checks tenant access
 * 3. Provides tenant and user data to child components via context
 * 4. Handles loading and error states
 *
 * Use this at the layout level to protect entire sections of your app
 * and provide tenant/user context to all child components.
 */
export default function ProtectedLayout({
  domain,
  children,
  fallback = <div>Loading...</div>,
  errorComponent = (error: Error) => <div>Error: {error.message}</div>,
}: {
  domain: string;
  children: ReactNode;
  fallback?: ReactNode;
  errorComponent?: (error: Error) => ReactNode;
}) {
  const accessData = useTenantAndUserAccess(domain);
  const { isLoading, error, hasAccess, user, tenant } = accessData;

  // Show loading state while checking access
  if (isLoading) return <>{fallback}</>;

  // Show error state if there's an error
  if (error) return <>{errorComponent(error)}</>;

  // Don't render children if there's no user or no access
  if (!user || !hasAccess || !tenant) {
    return <>{fallback}</>;
  }

  return (
    <TenantAndUserAccessContext.Provider value={accessData}>
      {children}
    </TenantAndUserAccessContext.Provider>
  );
}
