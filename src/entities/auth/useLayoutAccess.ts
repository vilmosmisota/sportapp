import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo } from "react";
import { useTenantAndUserAccessContext } from "../../composites/auth/TenantAndUserAccessContext";
import { Access } from "../role/Role.schema";

export type LayoutAccessDenialReason =
  | "NO_USER"
  | "NO_TENANT_ACCESS"
  | "INSUFFICIENT_ACCESS_LEVEL";

export interface LayoutAccessConfig {
  requiredAccess?: Access[];
  allowSystemRole?: boolean;
}

export default function useLayoutAccess(config: LayoutAccessConfig = {}) {
  const router = useRouter();
  const { tenant, tenantUser, isLoading, error } =
    useTenantAndUserAccessContext();

  const { requiredAccess = [], allowSystemRole = true } = config;

  const hasAccessToTenant = useMemo(() => {
    return !!(tenant && tenantUser && tenantUser.tenantId === tenant.id);
  }, [tenant, tenantUser]);

  const hasRequiredAccess = useMemo(() => {
    if (!tenantUser?.role) return false;

    const userAccess = tenantUser.role.access || [];

    // System access bypasses all other checks if allowed
    if (allowSystemRole && userAccess.includes(Access.SYSTEM)) {
      return true;
    }

    // If no specific access is required, return true
    if (requiredAccess.length === 0) return true;

    // Check if user has at least one of the required access levels
    return requiredAccess.some((access) => userAccess.includes(access));
  }, [tenantUser, requiredAccess, allowSystemRole]);

  const hasFullAccess = useMemo(() => {
    return hasAccessToTenant && hasRequiredAccess;
  }, [hasAccessToTenant, hasRequiredAccess]);

  const accessDenialReason = useMemo((): LayoutAccessDenialReason | null => {
    if (!tenantUser) return "NO_USER";
    if (!hasAccessToTenant) return "NO_TENANT_ACCESS";
    if (!hasRequiredAccess) return "INSUFFICIENT_ACCESS_LEVEL";
    return null;
  }, [tenantUser, hasAccessToTenant, hasRequiredAccess]);

  useEffect(() => {
    if (isLoading || !tenant) return;

    if (!tenantUser) {
      startTransition(() => {
        router.push("/auth/login");
      });
      return;
    }

    if (!hasFullAccess && accessDenialReason) {
      startTransition(() => {
        router.push(
          `/auth/no-access?reason=${accessDenialReason}&domain=${tenant.domain}`
        );
      });
    }
  }, [
    isLoading,
    tenant,
    tenantUser,
    hasFullAccess,
    accessDenialReason,
    router,
  ]);

  return useMemo(
    () => ({
      tenant,
      tenantUser,
      isLoading,
      error,
      hasFullAccess,
      hasAccessToTenant,
      hasRequiredAccess,
      accessDenialReason,
    }),
    [
      tenant,
      tenantUser,
      isLoading,
      error,
      hasFullAccess,
      hasAccessToTenant,
      hasRequiredAccess,
      accessDenialReason,
    ]
  );
}
