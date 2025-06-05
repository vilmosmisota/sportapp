import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo } from "react";
import { useTenantByDomain } from "../tenant/Tenant.query";
import { useCurrentUser } from "../user/User.query";

export type AccessDenialReason = "NO_USER" | "NO_TENANT_ACCESS";

export default function useTenantAndUserAccess(tenantDomain: string) {
  const router = useRouter();

  const {
    data: tenant,
    isLoading: tenantLoading,
    error: tenantError,
  } = useTenantByDomain(tenantDomain);

  const {
    data: tenantUser,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser(tenant?.id.toString() || "");

  const isLoading = tenantLoading || userLoading;
  const error = tenantError || userError;

  const hasAccessToTenant = useMemo(() => {
    return !!(tenant && tenantUser && tenantUser.tenantId === tenant.id);
  }, [tenant, tenantUser]);

  const accessDenialReason = useMemo((): AccessDenialReason | null => {
    if (!tenantUser) return "NO_USER";
    if (!hasAccessToTenant) return "NO_TENANT_ACCESS";
    return null;
  }, [tenantUser, hasAccessToTenant]);

  useEffect(() => {
    if (isLoading || !tenant) return;

    if (!tenantUser) {
      startTransition(() => {
        router.push("/login");
      });
      return;
    }

    if (!hasAccessToTenant && accessDenialReason) {
      startTransition(() => {
        router.push(
          `/no-access?reason=${accessDenialReason}&domain=${tenantDomain}`
        );
      });
    }
  }, [
    isLoading,
    tenant,
    tenantUser,
    hasAccessToTenant,
    accessDenialReason,
    router,
    tenantDomain,
  ]);

  return useMemo(
    () => ({
      tenant,
      tenantUser,
      isLoading,
      error,
    }),
    [tenant, tenantUser, isLoading, error]
  );
}
