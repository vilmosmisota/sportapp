import { useEffect, startTransition, useMemo } from "react";

import useCurrentRoleDomain from "../tenant/hooks/useCurrentRoleDomain";
import { useTenantByDomain } from "../tenant/Tenant.query";
import { useCurrentUser } from "../user/User.query";
import { RoleDomain } from "../role/Role.permissions";
import { useRouter } from "next/navigation";

export type AccessDenialReason =
  | "NO_USER"
  | "NO_TENANT_ACCESS"
  | "NO_DOMAIN_ROLE_ACCESS";

export default function useTenantAndUserAccess(tenantDomain: string) {
  const router = useRouter();
  const currentRoleDomain = useCurrentRoleDomain();

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

  const hasAccessToDomainRole = Boolean(
    tenant &&
      user?.roles?.some((r) => {
        // Role MUST be assigned to current tenant
        const hasTenantAccess = r.tenantId === tenant.id;

        // Check domain access (either matching domain or system role)
        const hasDomainAccess =
          r.role?.domain === currentRoleDomain ||
          r.role?.domain === RoleDomain.SYSTEM;

        return hasTenantAccess && hasDomainAccess;
      })
  );

  const hasAccess = hasAccessToTenant && hasAccessToDomainRole;

  // Determine the specific reason for access denial
  const accessDenialReason = useMemo((): AccessDenialReason | null => {
    if (!user) return "NO_USER";
    if (!hasAccessToTenant) return "NO_TENANT_ACCESS";
    if (!hasAccessToDomainRole) return "NO_DOMAIN_ROLE_ACCESS";
    return null;
  }, [user, hasAccessToTenant, hasAccessToDomainRole]);

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
      hasAccessToDomainRole,
      accessDenialReason,
    }),
    [
      tenant,
      user,
      isLoading,
      error,
      hasAccess,
      hasAccessToTenant,
      hasAccessToDomainRole,
      accessDenialReason,
    ]
  );
}
