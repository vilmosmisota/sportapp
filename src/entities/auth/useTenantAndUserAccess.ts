import { startTransition, useEffect, useMemo } from "react";

import { useRouter } from "next/navigation";
import useCurrentUserDomain from "../tenant/hooks/useCurrentRoleDomain";
import { useTenantByDomain } from "../tenant/Tenant.query";
import { useCurrentUser } from "../user/User.query";
import { UserDomain } from "../user/User.schema";

export type AccessDenialReason =
  | "NO_USER"
  | "NO_TENANT_ACCESS"
  | "NO_DOMAIN_ACCESS";

export default function useTenantAndUserAccess(tenantDomain: string) {
  const router = useRouter();
  const currentUserDomain = useCurrentUserDomain();

  const {
    data: tenant,
    isLoading: tenantLoading,
    error: tenantError,
  } = useTenantByDomain(tenantDomain);
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();

  const isLoading = tenantLoading || userLoading;
  const error = tenantError || userError;

  const hasAccessToTenant = Boolean(
    tenant && user?.tenantUsers?.some((tu) => tu.tenantId === tenant.id)
  );

  const hasAccessToUserDomain = useMemo(() => {
    if (!tenant || !user || !currentUserDomain) return false;

    // System users have access to everything
    if (user.userDomains?.includes(UserDomain.SYSTEM)) return true;

    // Check if user has the required domain access
    if (user.userDomains?.includes(currentUserDomain)) return true;

    // If user has a role, check if it's for the current tenant
    if (user.role) {
      return user.role.tenantId === tenant.id;
    }

    return false;
  }, [tenant, user, currentUserDomain]);

  const hasAccess = hasAccessToTenant && hasAccessToUserDomain;

  const accessDenialReason = useMemo((): AccessDenialReason | null => {
    if (!user) return "NO_USER";
    if (!hasAccessToTenant) return "NO_TENANT_ACCESS";
    if (!hasAccessToUserDomain) return "NO_DOMAIN_ACCESS";
    return null;
  }, [user, hasAccessToTenant, hasAccessToUserDomain]);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      startTransition(() => {
        router.push("/login");
      });
      return;
    }

    if (!hasAccess) {
      startTransition(() => {
        router.push(
          `/no-access?reason=${accessDenialReason}&domain=${tenantDomain}`
        );
      });
    }
  }, [isLoading, user, hasAccess, router, accessDenialReason, tenantDomain]);

  return useMemo(
    () => ({
      tenant,
      user,
      isLoading,
      error,
      hasAccess,
      hasAccessToTenant,
      hasAccessToUserDomain,
      accessDenialReason,
    }),
    [
      tenant,
      user,
      isLoading,
      error,
      hasAccess,
      hasAccessToTenant,
      hasAccessToUserDomain,
      accessDenialReason,
    ]
  );
}
