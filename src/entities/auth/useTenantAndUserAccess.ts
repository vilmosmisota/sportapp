import { useEffect, startTransition, useMemo } from "react";

import useCurrentRoleDomain from "../tenant/hooks/useCurrentRoleDomain";
import { useTenantByDomain } from "../tenant/Tenant.query";
import { useCurrentUser } from "../user/User.query";
import { RoleDomain } from "../role/Role.permissions";
import { useRouter } from "next/navigation";

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
        router.push("/no-access");
      });
    }
  }, [isLoading, user, hasAccess, router]);

  return useMemo(
    () => ({
      tenant,
      user,
      isLoading,
      error,
      hasAccess,
      hasAccessToTenant,
      hasAccessToDomainRole,
    }),
    [
      tenant,
      user,
      isLoading,
      error,
      hasAccess,
      hasAccessToTenant,
      hasAccessToDomainRole,
    ]
  );
}
