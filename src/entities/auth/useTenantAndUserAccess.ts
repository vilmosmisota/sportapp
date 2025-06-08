import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo } from "react";
import { useTenantByDomain } from "../tenant/Tenant.query";
import { useCurrentUser } from "../user/User.query";

export type AccessDenialReason = "NO_USER" | "NO_TENANT_ACCESS";

const EXCEPTION_ROUTES = ["/auth", "/privacy"];

export default function useTenantAndUserAccess(tenantDomain: string) {
  const router = useRouter();
  const pathname = usePathname();

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

  const isExceptionRoute = useMemo(() => {
    return EXCEPTION_ROUTES.some((route) => pathname.startsWith(route));
  }, [pathname]);

  useEffect(() => {
    if (isExceptionRoute) return;

    if (isLoading || !tenant) return;

    if (!tenantUser) {
      startTransition(() => {
        router.push("/auth/login");
      });
      return;
    }

    if (!hasAccessToTenant && accessDenialReason) {
      startTransition(() => {
        router.push(
          `/auth/no-access?reason=${accessDenialReason}&domain=${tenantDomain}`
        );
      });
    }
  }, [
    isExceptionRoute,
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
